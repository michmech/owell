export const wordcounter={
  countWords: function(text){
    text = text.replace(/\(([0-9]+):([0-9]+)\)/g, " ");
    const words = text.split(" ").filter(w => w.trim()!="");
    return words.length;
  },
}