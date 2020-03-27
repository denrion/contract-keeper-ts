const hasDuplicateValues = (array: any[], uniqueElement: string) => {
  const arrayOfQualifications = array.map(el => el[uniqueElement]);
  const setOfQualifications = new Set(arrayOfQualifications);
  return arrayOfQualifications.length === setOfQualifications.size;
};

export default hasDuplicateValues;
