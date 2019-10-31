#!/usr/bin/env node

if (process.argv.length !== 3) {
  console.error('Please provide "PaperCall.io" JSON as argument');
  process.exit(1);
}

var fs = require("fs");
var _ = require("lodash");

var contents = fs.readFileSync(process.argv[2], "utf8");
var data = JSON.parse(contents);

var acceptedSpeakers = data.filter(submission => {
  return submission.state == "accepted";
});

var speakers = acceptedSpeakers.map(x => {
  return {
    [_.snakeCase(x.name)]: {
      bio: x.bio,
      company: x.organization,
      country: x.location,
      features: false,
      name: x.name
    }
  };
});

const complexityMapper = pc => {
  if (pc === "All") {
    return "Beginner";
  } else {
    return pc;
  }
};

var sessions = acceptedSpeakers.map((x, i) => {
  var index = 100 + i;
  return {
    [index]: {
      complexity: complexityMapper(x.audience_level),
      description: x.description,
      speakers: _.compact([x.name, x.name_2].map(name => _.snakeCase(name))),
      tags: x.tags,
      title: x.title
    }
  };
});

fs.writeFileSync("speakers.json", JSON.stringify(speakers, null, 2));
fs.writeFileSync("sessions.json", JSON.stringify(sessions, null, 2));
