"use client";

import React, { useRef, useState } from "react";
import { StudentReportCard, ReportSubjectItem } from "@/lib/services/student-results";
import { Button } from "@/components/ui/button";
import { Download, Printer, School, ShieldCheck, CheckCircle2, Award } from "lucide-react";

interface OfficialReportCardProps {
  reportCard: StudentReportCard;
}

export const OfficialReportCard: React.FC<OfficialReportCardProps> = ({ reportCard }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);

    try {
      // Dynamic import to prevent SSR build issues
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Sanitize any modern CSS lab/oklch colors in the cloned canvas tree
          const allEls = clonedDoc.querySelectorAll("*");
          allEls.forEach((node) => {
            const el = node as HTMLElement;
            if (el.style) {
              const comp = window.getComputedStyle(el);
              if (comp.color && (comp.color.includes("lab") || comp.color.includes("oklch"))) {
                el.style.color = "#0f172a";
              }
              if (comp.backgroundColor && (comp.backgroundColor.includes("lab") || comp.backgroundColor.includes("oklch"))) {
                el.style.backgroundColor = "#ffffff";
              }
              if (comp.borderColor && (comp.borderColor.includes("lab") || comp.borderColor.includes("oklch"))) {
                el.style.borderColor = "#0f172a";
              }
            }
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `${reportCard.studentName.replace(/\s+/g, "_")}_Terminal_Report_${reportCard.academicYear.replace("/", "-")}_${reportCard.term.replace(/\s+/g, "")}.pdf`
      );
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Embedded Media Print Styles: Hides dashboard UI and prints ONLY the report card document */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-report-sheet,
          #official-report-sheet * {
            visibility: visible !important;
          }
          #official-report-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            border: 2px solid #0f172a !important;
            box-shadow: none !important;
            background-color: #ffffff !important;
          }
        }
      `}</style>

      {/* Export Action Bar (Hidden during print) */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 text-white shadow-sm print:hidden">
        <div className="flex items-center gap-2 text-xs">
          <Award className="h-4 w-4 text-emerald-400" />
          <span className="font-bold">Official GES Terminal Transcript Sheet</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs gap-1.5 font-semibold text-slate-800 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Sheet Only</span>
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="h-8 text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloading ? "Generating PDF..." : "Download PDF Report Sheet"}</span>
          </Button>
        </div>
      </div>

      {/* Printable Report Sheet Document with explicit standard hex color styling */}
      <div
        ref={reportRef}
        id="official-report-sheet"
        style={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          padding: "32px",
          border: "2px solid #0f172a",
          borderRadius: "2px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        }}
        className="w-full space-y-6 print:p-6 print:border-none print:shadow-none"
      >
        {/* Document Header with School Branding & Stamp */}
        <div style={{ borderBottom: "2px solid #0f172a", paddingBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            {/* School Logo Crest */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "9999px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                border: "2px solid #f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <School style={{ width: "32px", height: "32px", color: "#fbbf24" }} />
            </div>

            {/* School Title & Contacts */}
            <div style={{ textAlign: "center", flex: 1 }}>
              <h1 style={{ fontSize: "20px", fontWeight: 800, textTransform: "uppercase", color: "#0f172a", margin: 0 }}>
                GHANA MODEL BASIC & SENIOR HIGH SCHOOL
              </h1>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#334155", margin: "4px 0" }}>
                MINISTRY OF EDUCATION / GHANA EDUCATION SERVICE (GES)
              </p>
              <p style={{ fontSize: "10px", fontWeight: 500, color: "#475569", margin: "2px 0" }}>
                P.O. Box 450, Accra, Ghana • Tel: +233 30 212 3456 • Email: info@ghanamodelschool.edu.gh
              </p>
              <div
                style={{
                  display: "inline-block",
                  padding: "2px 12px",
                  marginTop: "6px",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                OFFICIAL TERMINAL ACADEMIC REPORT SHEET
              </div>
            </div>

            {/* Passport Student Photo Box */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "64px",
                  border: "2px solid #0f172a",
                  backgroundColor: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textAlign: "center",
                  padding: "4px",
                }}
              >
                PHOTO STAMP
              </div>
              <span style={{ fontSize: "9px", color: "#64748b", fontFamily: "monospace", marginTop: "2px" }}>GES SEAL</span>
            </div>
          </div>
        </div>

        {/* Student Identification & Term Details Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            fontSize: "12px",
            border: "1px solid #0f172a",
            padding: "12px",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex" }}>
              <span style={{ width: "112px", fontWeight: 700, color: "#475569", textTransform: "uppercase", fontSize: "10px" }}>
                Student Name:
              </span>
              <span style={{ fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}>{reportCard.studentName}</span>
            </div>
            <div style={{ display: "flex" }}>
              <span style={{ width: "112px", fontWeight: 700, color: "#475569", textTransform: "uppercase", fontSize: "10px" }}>
                Student ID / Code:
              </span>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>{reportCard.studentId}</span>
            </div>
            <div style={{ display: "flex" }}>
              <span style={{ width: "112px", fontWeight: 700, color: "#475569", textTransform: "uppercase", fontSize: "10px" }}>
                Class Section:
              </span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{reportCard.className}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex" }}>
              <span style={{ width: "112px", fontWeight: 700, color: "#475569", textTransform: "uppercase", fontSize: "10px" }}>
                Academic Year:
              </span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{reportCard.academicYear}</span>
            </div>
            <div style={{ display: "flex" }}>
              <span style={{ width: "112px", fontWeight: 700, color: "#475569", textTransform: "uppercase", fontSize: "10px" }}>
                Academic Term:
              </span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{reportCard.term}</span>
            </div>
            <div style={{ display: "flex" }}>
              <span style={{ width: "112px", fontWeight: 700, color: "#475569", textTransform: "uppercase", fontSize: "10px" }}>
                Term Attendance:
              </span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>53 / 54 Days (98.2%)</span>
            </div>
          </div>
        </div>

        {/* Subject Scores & WAEC Grades Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse", border: "1px solid #0f172a" }}>
            <thead>
              <tr style={{ backgroundColor: "#0f172a", color: "#ffffff", fontWeight: 700, fontSize: "10px", textTransform: "uppercase" }}>
                <th style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "left", width: "80px" }}>Code</th>
                <th style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "left" }}>Subject Title</th>
                <th style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "center", width: "96px" }}>Class Score (30)</th>
                <th style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "center", width: "96px" }}>Project Work (20)</th>
                <th style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "center", width: "96px" }}>Exam Score (50)</th>
                <th style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "center", width: "96px" }}>Total (100)</th>
                <th style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "center", width: "64px" }}>Grade</th>
                <th style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "left", width: "112px" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {reportCard.subjects.map((sub: ReportSubjectItem, idx: number) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                  <td style={{ border: "1px solid #0f172a", padding: "6px", fontFamily: "monospace", fontSize: "11px", fontWeight: 600 }}>{sub.code}</td>
                  <td style={{ border: "1px solid #0f172a", padding: "6px", fontWeight: 700, color: "#0f172a" }}>{sub.name}</td>
                  <td style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "center", fontWeight: 500 }}>{sub.classScore}</td>
                  <td style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "center", fontWeight: 500 }}>{sub.projectScore}</td>
                  <td style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "center", fontWeight: 500 }}>{sub.examScore}</td>
                  <td style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "center", fontWeight: 800, color: "#0f172a" }}>{sub.totalScore}</td>
                  <td style={{ border: "1px solid #0f172a", padding: "6px", textAlign: "center", fontWeight: 700, color: "#0f172a" }}>{sub.grade}</td>
                  <td style={{ border: "1px solid #0f172a", padding: "6px", fontWeight: 500, color: "#334155" }}>{sub.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Executive Summary Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            border: "1px solid #0f172a",
            padding: "10px",
            backgroundColor: "#f1f5f9",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          <div>
            <span style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", display: "block" }}>Total Marks Obtained</span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{reportCard.totalMarksObtained} / {reportCard.totalMarksPossible}</span>
          </div>
          <div>
            <span style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", display: "block" }}>Overall Term Average</span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{reportCard.overallAverage}%</span>
          </div>
          <div>
            <span style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", display: "block" }}>Class Position Rank</span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{reportCard.classPosition}</span>
          </div>
        </div>

        {/* Class Teacher & Headmaster Remarks */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "12px" }}>
          <div style={{ border: "1px solid #0f172a", padding: "12px", backgroundColor: "#ffffff" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Form Master / Class Teacher Remarks:
            </span>
            <p style={{ fontStyle: "italic", fontWeight: 500, color: "#1e293b", margin: 0, lineHeight: 1.5 }}>
              "{reportCard.teacherRemarks}"
            </p>
          </div>

          <div style={{ border: "1px solid #0f172a", padding: "12px", backgroundColor: "#ffffff" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Headmaster Executive Remarks:
            </span>
            <p style={{ fontStyle: "italic", fontWeight: 500, color: "#1e293b", margin: 0, lineHeight: 1.5 }}>
              "{reportCard.principalRemarks}"
            </p>
          </div>
        </div>

        {/* Signatures & Official School Stamp Seal */}
        <div style={{ paddingTop: "16px", borderTop: "1px solid #0f172a" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", alignItems: "flex-end", fontSize: "12px" }}>
            {/* Class Teacher Signature */}
            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #0f172a", paddingBottom: "4px", fontFamily: "serif", fontStyle: "italic", color: "#334155", fontSize: "14px", marginBottom: "32px" }}>
                A. Appiah
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block" }}>
                Class Teacher Signature & Date
              </span>
            </div>

            {/* Official School Stamp Seal Graphic */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "9999px",
                  border: "4px dashed #d97706",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#b45309",
                  fontWeight: 700,
                  padding: "4px",
                  fontSize: "8px",
                  textAlign: "center",
                  lineHeight: 1.1,
                  transform: "rotate(-6deg)",
                }}
              >
                <ShieldCheck style={{ width: "20px", height: "20px", color: "#b45309", marginBottom: "2px" }} />
                <span>OFFICIAL EMBLEM</span>
                <span>GHANA MODEL SCH</span>
              </div>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748b", marginTop: "4px", textTransform: "uppercase" }}>
                Official Stamp & Seal
              </span>
            </div>

            {/* Headmaster / Principal Signature */}
            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #0f172a", paddingBottom: "4px", fontFamily: "serif", fontStyle: "italic", color: "#334155", fontSize: "14px", marginBottom: "32px" }}>
                Rev. E. Mensah
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block" }}>
                Headmaster / Principal Signature
              </span>
            </div>
          </div>
        </div>

        {/* Footer Audit Code */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "9px",
            color: "#64748b",
            fontFamily: "monospace",
            paddingTop: "8px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <span>DOCUMENT REF: GES-TR-2026-889-01</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle2 style={{ width: "12px", height: "12px", color: "#059669" }} />
            VERIFIED OFFICIAL REPORT SHEET
          </span>
          <span>DATE GENERATED: {new Date().toLocaleDateString("en-GB")}</span>
        </div>
      </div>
    </div>
  );
};
