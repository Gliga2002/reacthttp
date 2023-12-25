export async function fetchUserPlaces() {
   // newtowrk error, server crashed
   const response = await fetch('http://localhost:3000/user-places');
   const resData =  await response.json();

   // 494, on to ne priajvljuje kao gresku pa ti to moras
   if (!response.ok)
      throw new Error('Failed to fetch user places');

   return resData.places;
}