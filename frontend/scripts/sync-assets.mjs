import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const dest = path.join(frontendRoot, "public", "static");
const repoRoot = path.resolve(frontendRoot, "..");
const src = path.join(repoRoot, "theme", "static");
const marker = path.join(dest, "css", "style.css");

if (fs.existsSync(marker)) {
  console.log("[sync-assets] тема уже в public/static");
  process.exit(0);
}

if (!fs.existsSync(src)) {
  console.error(
    "[sync-assets] Нет theme/static. Добавьте статику темы в theme/static (css, js, fonts, images)."
  );
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log("[sync-assets] скопировано в", dest);
