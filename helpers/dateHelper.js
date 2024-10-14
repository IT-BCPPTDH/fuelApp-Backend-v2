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
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

function formattedHHMM(hour) {
    const [hours, minutes] = hour.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
        return 'Invalid time';
    }

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

const formatYYYYMMDDBefore = (date, interval) => {
    const dateObj = new Date(date);
  
    // Kurangi 7 hari dari tanggal tersebut
    dateObj.setDate(dateObj.getDate() - interval);
    
    // Format ulang ke 'YYYY-MM-DD'
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');  // Bulan dimulai dari 0
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    resultDate = `${year}-${month}-${day}`;
    return resultDate
}

module.exports ={
    formatYYYYMMDD,
    prevFormatYYYYMMDD,
    formatDateToDDMMYYYY,
    formatDateTimeToDDMMYYYY_HHMMSS,
    formattedHHMM,
    formatYYYYMMDDBefore,
    formatYYYYMMDDBefore
}