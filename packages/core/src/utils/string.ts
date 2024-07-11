export function titleCase(str: string) {
  return str
    .toLowerCase()
    .replace("_", " ")
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
