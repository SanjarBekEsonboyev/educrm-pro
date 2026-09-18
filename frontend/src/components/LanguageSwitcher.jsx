import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "uz", label: "UZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="lang-switch">
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={`lang-btn${i18n.resolvedLanguage === l.code ? " on" : ""}`}
          onClick={() => i18n.changeLanguage(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
