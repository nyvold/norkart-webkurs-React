export const getBygningAtPunkt = async (x: number, y: number) => {
  const apiKey = import.meta.env.VITE_API_KEY;
  const query = `https://bygning.api.norkart.no/bygninger/byposition?x=${x}&y=${y}&MaxRadius=1&GeometryTextFormat=GeoJson&IncludeFkbData=true`;

  try {
    const apiResult = await fetch(query, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-WAAPI-TOKEN': `${apiKey}`,
      },
    });

    if (apiResult.ok) {
      const rawText = await apiResult.text();
      console.log('Raw API Response:', rawText);

      const data = JSON.parse(rawText);
      console.log('Parsed JSON Response:', data);

      return data.length > 0 ? data[0] : data;
    } else {
      console.error(
        'API request failed with status:',
        apiResult.status,
        'URL:',
        query
      );
      const errorText = await apiResult.text();
      console.error('Error response body:', errorText);
      return null;
    }
  } catch (error) {
    console.error('An error occurred while fetching building data:', error);
    return null;
  }

  // TODO: Fullfør/endre koden for hente og returnere bygningsdata på et punkt

  // Hint: Du kan se på getAdresseFromSearchText og getHoydeFromPunkt for å få en idé om hvordan
  // dette kan gjøres.

  // Merk at dette er en GET request, og ikke en POST request!

  // Når du har fått til kallet til API-et kan du se i Network-taben i nettleseren eller i
  // konsollen for å se hvordan responsen ser ut.
};
