const formatYYYYMMDD = (dateStr) =>{
    const date = new Date(dateStr);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

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

const formatDateOption = (option, date) => {
    let dateBefore
    if(option == "Daily"){
        return dateBefore = date
    }else if(option == "Weekly"){
        const resultDate = formatYYYYMMDDBefore(date, 7)
        return dateBefore = resultDate
    }else if(option == "Monthly"){
        const resultDate = formatYYYYMMDDBefore(date, 30)
        return dateBefore = resultDate
    }else{
        const resultDate = formatYYYYMMDDBefore(date, 365)
        return dateBefore = resultDate
    }
}

const formatedMonth = (dateStr) => {
    const date = new Date(dateStr);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options);
    return formattedDate
}

const formatedDatesNames = (dateStr) => {
    const date = new Date(dateStr);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    let formattedDate = date.toLocaleDateString('en-GB', options);
    formattedDate = formattedDate.replace(/\s/g, '-');
    return formattedDate
}

const formatedDatesYYYYMMDD = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    const formattedDate = `${year}${month}${day}`;
    return formattedDate
}

const getFirstDate = (dateStr) => {
    const givenDate = new Date(dateStr);
    if (givenDate.getDate() === 1) {
        return dateStr; 
    }

    const startOfMonth = new Date(Date.UTC(givenDate.getUTCFullYear(), givenDate.getUTCMonth(), 1));
    const formattedDate = startOfMonth.toISOString().split('T')[0];

    return formattedDate;
}

const formattedHeaders = (dateStr) =>{
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    return formattedDate
}

const formatDateMMYYYY = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) {
        console.error("Tanggal yang diberikan tidak valid:", dateStr);
        return null;
    }
    const options = { year: 'numeric', month: 'long' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    return formattedDate;
};

const formatDDMonthYYYY = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) {
        console.error("Tanggal yang diberikan tidak valid:", dateStr);
        return null;
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();


    return `${day} ${month} ${year}`;;
};

module.exports ={
    formatYYYYMMDD,
    prevFormatYYYYMMDD,
    formatDateToDDMMYYYY,
    formatDateTimeToDDMMYYYY_HHMMSS,
    formattedHHMM,
    formatYYYYMMDDBefore,
    formatDateOption, 
    formatedMonth,
    formatedDatesYYYYMMDD,
    formatedDatesNames,
    getFirstDate,
    formattedHeaders,
    formatDateMMYYYY,
    formatDDMonthYYYY
}