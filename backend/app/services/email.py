import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import get_settings


def send_feedback_notification(
    subject: str,
    sender_email: str,
    content: str,
    ip: str | None,
) -> None:
    """Отправляет email-уведомление о новом сообщении из формы обратной связи."""
    settings = get_settings()
    if not settings.smtp_host or not settings.feedback_to_email:
        return

    from_addr = settings.feedback_from_email or settings.smtp_user or sender_email
    body = f"От: {sender_email}\nIP: {ip or '—'}\n\n{content}"

    msg = MIMEMultipart()
    msg["Subject"] = f"[Сайт] {subject}"
    msg["From"] = from_addr
    msg["To"] = settings.feedback_to_email
    msg.attach(MIMEText(body, "plain", "utf-8"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as server:
        if settings.smtp_use_tls:
            server.ehlo()
            server.starttls()
            server.ehlo()
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(from_addr, [settings.feedback_to_email], msg.as_string())
