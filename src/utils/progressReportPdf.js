import { jsPDF } from 'jspdf';

/** Builds the one-page PDF behind Progress's "Share weekly report" button —
 * a plain, printable summary a patient can hand to a caregiver or send to
 * her care team, not a styled replica of the in-app cards. */
export function buildProgressReportPdf({ patientName, streak, totalTasksDone, taskGoal, periodLabel, metrics, previousLabel }) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const marginX = 48;
  let y = 56;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('ViveNow Progress Report', marginX, y);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`${patientName} · ${new Date().toLocaleDateString()}`, marginX, y);
  y += 28;

  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Adherence', marginX, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`${streak}-day streak`, marginX, y);
  y += 16;
  doc.text(`${totalTasksDone} of ${taskGoal} tasks completed this week`, marginX, y);
  y += 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Summary — ${periodLabel}`, marginX, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  for (const m of metrics) {
    if (y > 740) {
      doc.addPage();
      y = 56;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(m.label, marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(m.value, marginX + 140, y);
    doc.setTextColor(120);
    doc.text(`Today: ${m.today}`, marginX + 280, y);
    doc.setTextColor(20);
    y += 16;
    const pctText = m.pct === 0 ? `No change vs ${previousLabel}` : `${m.pct > 0 ? '+' : ''}${m.pct}% vs ${previousLabel}`;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(pctText, marginX, y);
    doc.setFontSize(11);
    doc.setTextColor(20);
    y += 20;
  }

  return doc;
}
