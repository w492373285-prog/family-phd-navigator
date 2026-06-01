import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { generatePlan } from '../services/planService.js';

export const planRouter = Router();

planRouter.post('/plan', (req, res) => {
  res.json(generatePlan(req.body));
});

planRouter.post('/report/pdf', (req, res) => {
  const plan = generatePlan(req.body);
  const doc = new PDFDocument({ margin: 44, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="family-phd-plan-report.pdf"');
  doc.pipe(res);

  doc.fontSize(18).text('Family PhD Overseas Planning Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('Note: PDFKit default fonts have limited Chinese glyph support. Please use the H5 report page for full Chinese text, and this PDF as a portable summary.');
  doc.moveDown();

  doc.fontSize(15).text('Top 3 Countries');
  plan.topCountries.forEach((country, index) => {
    doc.fontSize(11).text(`${index + 1}. ${country.name} - ${country.totalScore}/100`);
    doc.fontSize(10).text(`Risks: ${country.risks || '-'}`);
  });

  doc.moveDown();
  doc.fontSize(15).text('Recommended Path');
  doc.fontSize(11).text(plan.report.recommendedPath);

  doc.moveDown();
  doc.fontSize(15).text('12 Month Action Plan');
  plan.report.monthlyPlan.forEach(item => doc.fontSize(10).text(`- ${item}`));

  doc.moveDown();
  doc.fontSize(15).text('Budget');
  plan.budgets.forEach(item => {
    doc.fontSize(10).text(`${item.country}: CNY ${item.total.toLocaleString()} / year`);
  });

  doc.moveDown();
  doc.fontSize(15).text('Risk Warnings');
  plan.report.riskWarnings.forEach(item => doc.fontSize(10).text(`- ${item}`));

  doc.end();
});
