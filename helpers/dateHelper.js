const formatYYYYMMDD = (dateStr) =>{
    const date = new Date(dateStr);

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
}

const prevFormatYYYYMMDD = (dateStr) => {
    const date = new Date(dateStr)
    date.setDate(date.getDate() - 1);
    const formatPrev = date.toISOString().split('T')[0]
    return formatPrev
}

function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function formatDateTimeToDDMMYYYY_HHMMSS(dateString) {
    const date = new Date(dateString);
    
    // Format Tanggal
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // Format Waktu
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Gabungkan Tanggal dan Waktu
    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

module.exports ={
    formatYYYYMMDD,
    prevFormatYYYYMMDD,
    formatDateToDDMMYYYY,
    formatDateTimeToDDMMYYYY_HHMMSS
}