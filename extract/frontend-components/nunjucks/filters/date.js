function date (dateString, format) {
  if (!dateString) return null

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  if (format === 'dd/mm/yy hh:mm') {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString().slice(-2)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  if (format === 'dd/mm/yyyy') {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()
    return `${day}/${month}/${year}`
  }

  if (format === 'yyyy-mm-dd') {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()
    return `${year}-${month}-${day}`
  }

  // Default format
  return date.toLocaleString()
}

export default date
