import html2pdf from 'html2pdf.js';

export const generateComparisonReport = async (
  resumeDataA: any,
  resumeDataB: any,
  scoreDataA: any,
  scoreDataB: any
) => {
  // Extract scores from the generated ATS data
  const atsScoreA = scoreDataA?.overallScore || 70;
  const atsScoreB = scoreDataB?.overallScore || 70;
  const keywordScoreA = scoreDataA?.keywordScore || 65;
  const keywordScoreB = scoreDataB?.keywordScore || 65;
  const formatScoreA = scoreDataA?.formatScore || 75;
  const formatScoreB = scoreDataB?.formatScore || 75;
  const contentScoreA = scoreDataA?.contentScore || 70;
  const contentScoreB = scoreDataB?.contentScore || 70;
  
  // Determine which resume has the higher score
  const winner = atsScoreA >= atsScoreB ? 'resumeA' : 'resumeB';
  const scoreDiff = Math.abs(atsScoreA - atsScoreB);
  
  // Format the reason based on the winner and score difference
  let reason = '';
  if (scoreDiff <= 5) {
    reason = `Both resumes are very similar in ATS compatibility with only a ${scoreDiff}% difference. The winning resume has ${winner === 'resumeA' ? 'slightly better keyword optimization' : 'marginally improved formatting'}.`;
  } else if (scoreDiff <= 15) {
    reason = `Resume ${winner === 'resumeA' ? 'A' : 'B'} scores ${scoreDiff}% higher in ATS compatibility, making it more likely to pass automated screening. It has ${winner === 'resumeA' ? 'better keyword optimization and content structure' : 'improved formatting and more relevant keywords'}.`;
  } else {
    reason = `Resume ${winner === 'resumeA' ? 'A' : 'B'} significantly outperforms the other with ${scoreDiff}% higher ATS compatibility. This version should be your go-to for job applications as it's much more likely to pass automated screening.`;
  }
  
  // Combine recommendations from both resumes
  const allSuggestions = [
    ...(scoreDataA?.suggestions || []),
    ...(scoreDataB?.suggestions || [])
  ];
  
  // Deduplicate suggestions (removing similar ones)
  const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, 5);
  
  // Return structured data for the component to use
  return {
    resumeA: {
      atsScore: atsScoreA,
      keywordScore: keywordScoreA,
      formatScore: formatScoreA,
      contentScore: contentScoreA,
      strengths: [
        "Good overall structure with clear sections",
        "Contains relevant technical skills for the position",
        scoreDataA?.jobMatch ? "Well aligned with target job requirements" : "Includes relevant background information"
      ],
      weaknesses: [
        ...(scoreDataA?.suggestions || []).slice(0, 3)
      ]
    },
    resumeB: {
      atsScore: atsScoreB,
      keywordScore: keywordScoreB,
      formatScore: formatScoreB,
      contentScore: contentScoreB,
      strengths: [
        "Clear presentation of skills and experience",
        "Quantifies achievements with metrics",
        scoreDataB?.jobMatch ? "Contains good keyword optimization" : "Includes relevant technical skills"
      ],
      weaknesses: [
        ...(scoreDataB?.suggestions || []).slice(0, 3)
      ]
    },
    winner: winner,
    reason: reason,
    improvementSuggestions: uniqueSuggestions
  };
};

// Function to generate and download PDF directly
export const downloadPDF = (reportElement: HTMLElement, fileName: string = 'resume-comparison-report.pdf') => {
  // Create a clone of the element to avoid modifying the original DOM
  const clonedElement = reportElement.cloneNode(true) as HTMLElement;
  
  // Apply additional styles for PDF formatting
  clonedElement.style.width = "100%";
  clonedElement.style.maxWidth = "800px";
  clonedElement.style.margin = "0 auto";
  clonedElement.style.padding = "20px";
  clonedElement.style.backgroundColor = "#ffffff";
  clonedElement.style.color = "#000000";
  
  // Temporarily append to document but keep it invisible
  clonedElement.style.position = "absolute";
  clonedElement.style.left = "-9999px";
  document.body.appendChild(clonedElement);
  
  const opt = {
    margin: [10, 10, 10, 10],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  // Return a promise to allow for proper handling
  return html2pdf().set(opt).from(clonedElement).save()
    .then(() => {
      // Clean up the cloned element
      document.body.removeChild(clonedElement);
      return true;
    })
    .catch(error => {
      console.error("PDF generation error:", error);
      document.body.removeChild(clonedElement);
      
      // Fallback mechanism for browsers that have issues with html2pdf
      try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) throw new Error("Could not open print window");
        
        printWindow.document.write('<html><head><title>Resume Report</title>');
        printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 20px; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(clonedElement.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        
        return true;
      } catch (fallbackError) {
        console.error("Print fallback error:", fallbackError);
        throw error; // Re-throw the original error
      }
    });
};

// Helper function to get color based on score
export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#059669'; // Green
  if (score >= 60) return '#0891b2'; // Teal
  if (score >= 40) return '#d97706'; // Amber
  return '#dc2626'; // Red
};
