/**
 * ResuMake - PDF Export Orchestrator
 */

function downloadPDF(containerElement, resumeTitle = 'resume') {
    if (!containerElement) {
        showToast('Error', 'Unable to find preview element.', 'danger');
        return;
    }

    // Verify html2pdf is loaded from CDN
    if (typeof html2pdf === 'undefined') {
        showToast('Export Error', 'PDF export library is still loading. Please wait a moment.', 'danger');
        return;
    }

    showToast('Preparing Export', 'Generating high-resolution PDF document...', 'info');

    // Filename safety
    const safeFilename = resumeTitle.toLowerCase().trim().replace(/[^a-z0-9]/g, '_') + '.pdf';

    // PDF Configuration
    const opt = {
        margin:       0,
        filename:     safeFilename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2.5,          // High DPI resolution for clean prints
            useCORS: true,       // Critical to allow external profile image URLs
            letterRendering: true,
            scrollY: 0           // Avoid viewport clipping if scrolled
        },
        jsPDF:        { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Execute html2pdf promise pipeline
    html2pdf()
        .set(opt)
        .from(containerElement)
        .save()
        .then(() => {
            showToast('Download Started!', 'Your PDF has been successfully generated and downloaded.', 'success');
        })
        .catch(err => {
            console.error('PDF Generation error: ', err);
            showToast('Export Failed', 'An error occurred while compiling your PDF.', 'danger');
        });
}
