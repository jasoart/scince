import { useState } from "react";
import { ArrowRight, BookOpen, Check, Search } from "lucide-react";
import { coverage } from "../data/coverage";
import { subjects } from "../data/curriculum";
import { scopeSource } from "../data/official-scope";
import type { ScopeSubject } from "../data/official-scope";
import "./CurriculumMap.css";

export default function CurriculumMap({
  onOpen,
}: {
  onOpen: (id: string) => void;
}) {
  const [subject, setSubject] = useState<ScopeSubject | "all">("all");
  const [query, setQuery] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  const rows = coverage.filter(
    (row) =>
      (subject === "all" || row.subject === subject) &&
      (!missingOnly || row.lessons.length === 0) &&
      `${row.code} ${row.description} ${row.lessons.map((l) => l.title).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const knowledge = coverage.filter((row) => row.subject !== "inquiry");
  const inquiry = coverage.filter((row) => row.subject === "inquiry");
  const linked = coverage.filter((row) => row.lessons.length > 0).length;
  return (
    <section className="cm-map" aria-label="課綱與單元對照">
      <div className="cm-summary">
        <div>
          <span>四科必修學習內容</span>
          <strong>
            {knowledge.length}
            <small> 條</small>
          </strong>
        </div>
        <div>
          <span>探究與實作子項</span>
          <strong>
            {inquiry.length}
            <small> 項</small>
          </strong>
        </div>
        <div>
          <span>已連結教學入口</span>
          <strong>
            {linked}
            <small> / {coverage.length}</small>
          </strong>
        </div>
      </div>
      <div className="cm-source">
        <BookOpen size={19} />
        <div>
          <strong>{scopeSource.title}</strong>
          <p>
            依附件附錄二逐條整理，四科代碼沿用原文；IQ
            為本站探究索引。頁碼指附件印刷頁，並列含封面的 PDF
            頁序。連結表示有對應教學，不等同外部認證或你的掌握程度。
          </p>
        </div>
      </div>
      <div className="cm-tools">
        <div className="tabs" aria-label="課綱科別">
          <button
            className={subject === "all" ? "selected" : ""}
            onClick={() => setSubject("all")}
          >
            全部
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              className={subject === s.id ? "selected" : ""}
              onClick={() => setSubject(s.id)}
            >
              {s.name}
            </button>
          ))}
          <button
            className={subject === "inquiry" ? "selected" : ""}
            onClick={() => setSubject("inquiry")}
          >
            探究與實作
          </button>
        </div>
        <label className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋課綱代碼或觀念…"
            aria-label="搜尋課綱代碼或觀念"
          />
        </label>
      </div>
      <div className="results-label">
        <span>{rows.length} 個對照項目</span>
        <label>
          <input
            type="checkbox"
            checked={missingOnly}
            onChange={(e) => setMissingOnly(e.target.checked)}
          />
          僅看尚未連結項目
        </label>
      </div>
      <div className="cm-rows">
        {rows.map((row) => (
          <article key={row.code} className="cm-row">
            <div className="cm-code">
              <span>{row.subject === "inquiry" ? "探究索引" : "課綱代碼"}</span>
              <strong>{row.code}</strong>
              <small>
                印刷 p.{row.sourcePage} · PDF p.{row.pdfPage}
              </small>
            </div>
            <div className="cm-content">
              <h2>{row.description}</h2>
              {row.rationale && <p>{row.rationale}</p>}
              <div className="cm-links">
                {row.lessons.map((lesson) => (
                  <button key={lesson.id} onClick={() => onOpen(lesson.id)}>
                    <Check size={12} />
                    {lesson.title}
                    <ArrowRight size={13} />
                  </button>
                ))}
              </div>
              {!row.lessons.length && (
                <span className="cm-pending">
                  尚未連結教學，保留缺口供後續補寫。
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
      {!rows.length && (
        <div className="empty-state">
          <BookOpen size={26} />
          <p>
            {missingOnly
              ? "目前篩選範圍沒有尚未連結的條目。"
              : "找不到對應項目，請調整關鍵字。"}
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setMissingOnly(false);
            }}
          >
            回到全部對照
          </button>
        </div>
      )}
      <p className="source-note">{scopeSource.notes.join(" ")}</p>
    </section>
  );
}
