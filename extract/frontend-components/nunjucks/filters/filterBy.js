export default function filterBy (arr, key, value) {
  if (!Array.isArray(arr)) return []
  return arr.filter((item) => item && item[key] === value)
}
