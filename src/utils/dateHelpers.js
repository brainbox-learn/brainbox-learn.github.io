/**
 * Get local date string in YYYY-MM-DD format (timezone-aware)
 */
export const getLocalDateString = (date = new Date()) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
  };
  
  /**
   * Get yesterday's local date string
   */
  export const getYesterdayDateString = () => {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return getLocalDateString(yesterday);
  };