export const byId = (id) => document.getElementById(id);

// Kimlikli her öğe kimliğiyle aynı adla toplanır: elements.startSessionButton === #startSessionButton.
// Yeni bir öğe eklemek için HTML'e id vermek yeterlidir.
export function getElements() {
  const elements = { screens: [...document.querySelectorAll(".screen")] };
  for (const element of document.querySelectorAll("[id]")) elements[element.id] = element;
  return elements;
}
