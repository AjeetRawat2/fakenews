import nlp from "compromise";

export const extractEntities = (text) => {

  const doc = nlp(text);

  return {
    people: doc.people().out("array"),
    organizations: doc.organizations().out("array"),
    locations: doc.places().out("array")
  };

};