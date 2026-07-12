async function test() {
  const r = await fetch('http://localhost:8080/api/hotels/search?query=Bangalore');
  const text = await r.json();
  console.log(text.searchResults[0]);
}
test();
