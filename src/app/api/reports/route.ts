/**
 * Reports API Route
 *
 * POST — Generate a report (preliminary, case file, or summary)
 * GET  — List generated reports (no PII in any response)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generatePreliminaryReport,
  generateCaseFileReport,
  generateCaseSummary,
  type GeneratedReport,
} from "@/lib/reports/pdf-generator";
import { getOrchestration } from "@/lib/orchestrator/orchestrator";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("id");
  const matterId = searchParams.get("matterId");
  const format = searchParams.get("format");

  // Fetch specific report
  if (reportId) {
    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Return HTML for rendering/printing
    if (format === "html") {
      return new NextResponse(report.html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="${report.reportType}-${report.matterId}.html"`,
        },
      });
    }

    // Return metadata (no HTML blob)
    return NextResponse.json({
      id: report.id,
      reportType: report.reportType,
      matterId: report.matterId,
      generatedAt: report.createdAt.toISOString(),
      sizeBytes: report.sizeBytes,
      downloadUrl: `/api/reports?id=${report.id}&format=html`,
    });
  }

  // List reports for a matter
  if (matterId) {
    const reports = await db.report.findMany({
      where: { matterId },
      select: { id: true, reportType: true, matterId: true, createdAt: true, sizeBytes: true },
    });
    return NextResponse.json({
      count: reports.length,
      reports: reports.map(r => ({
        id: r.id,
        reportType: r.reportType,
        matterId: r.matterId,
        generatedAt: r.createdAt.toISOString(),
        sizeBytes: r.sizeBytes,
      })),
    });
  }

  // List all reports (just metadata)
  const all = await db.report.findMany({
    select: { id: true, reportType: true, matterId: true, createdAt: true, sizeBytes: true },
  });
  return NextResponse.json({
    count: all.length,
    reports: all.map(r => ({
      id: r.id,
      reportType: r.reportType,
      matterId: r.matterId,
      generatedAt: r.createdAt.toISOString(),
      sizeBytes: r.sizeBytes,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportType, matterId, matterType, orchestrationId, status, jurisdiction } = body;

    if (!reportType || !matterId) {
      return NextResponse.json(
        { error: "reportType and matterId are required" },
        { status: 400 }
      );
    }

    let report: GeneratedReport;

    switch (reportType) {
      case "preliminary_investigation": {
        // Pull context from orchestration if available
        let context: Record<string, unknown> = {};
        if (orchestrationId) {
          const orch = getOrchestration(orchestrationId);
          if (orch) {
            // We only pass the non-PII parts. The orchestrator already stripped PII.
            context = { matterId: orch.matterId, status: orch.status };
          }
        }
        report = generatePreliminaryReport(matterId, matterType || "general", context);
        break;
      }

      case "full_case_file": {
        let context: Record<string, unknown> = {};
        if (orchestrationId) {
          const orch = getOrchestration(orchestrationId);
          if (orch) {
            context = { matterId: orch.matterId, status: orch.status };
          }
        }
        report = generateCaseFileReport(matterId, matterType || "general", context);
        break;
      }

      case "case_summary": {
        report = generateCaseSummary(
          matterId,
          matterType || "general",
          status || "active",
          jurisdiction
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown reportType: ${reportType}. Use: preliminary_investigation, full_case_file, case_summary` },
          { status: 400 }
        );
    }

    // Persist to database
    await db.report.create({
      data: {
        id: report.id,
        reportType: report.reportType,
        matterId: report.matterId,
        html: report.html,
        sizeBytes: report.sizeBytes,
      },
    });

    return NextResponse.json({
      id: report.id,
      reportType: report.reportType,
      matterId: report.matterId,
      generatedAt: report.generatedAt,
      sizeBytes: report.sizeBytes,
      downloadUrl: `/api/reports?id=${report.id}&format=html`,
      message: "Report generated. No client PII included in output.",
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Report generation failed" },
      { status: 500 }
    );
  }
}
