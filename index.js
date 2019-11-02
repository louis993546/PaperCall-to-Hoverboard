#!/usr/bin/env node

if (process.argv.length !== 3) {
  console.error('Please provide "PaperCall.io" JSON as argument');
  process.exit(1);
}

var fs = require("fs");
var _ = require("lodash");

var contents = fs.readFileSync(process.argv[2], "utf8");
var data = JSON.parse(contents);

var dir = "./outputs";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

var acceptedSubmissions = data.filter(
  s => s.state == "accepted" && s.confirmed === true
);

// Sessions

const sessionComplexityMapper = pc => {
  if (pc === "All") {
    return "Beginner";
  } else {
    return pc;
  }
};

var sessions = acceptedSubmissions
  .map((x, i) => {
    var index = 100 + i;
    return {
      [index]: {
        complexity: sessionComplexityMapper(x.audience_level),
        description: x.description,
        speakers: [x.name, x.name_2]
          .map(name => _.snakeCase(name))
          .filter(n => n),
        // tags: x.tags,
        title: x.title
      }
    };
  })
  .reduce((acc, obj) => {
    return { ...acc, ...obj };
  });

fs.writeFileSync("outputs/sessions.json", JSON.stringify(sessions, null, 2));

// Speakers

var request = require("request");

const download = (uri, filename) => {
  request(uri).pipe(fs.createWriteStream(filename));
};

const baseUrl = "https://2019.devfest-berlin.de";

// TODO i can probably use babel or somethign to get flat, right?
Object.defineProperty(Array.prototype, "flat", {
  value: function(depth = 1) {
    return this.reduce(function(flat, toFlatten) {
      return flat.concat(
        Array.isArray(toFlatten) && depth > 1
          ? toFlatten.flat(depth - 1)
          : toFlatten
      );
    }, []);
  }
});

var speakers = acceptedSubmissions
  .map(s => {
    return [
      {
        name: s.name,
        avatar: s.avatar,
        location: s.location,
        bio: s.bio,
        twitter: s.twitter,
        url: s.url,
        organization: s.organization
      },
      {
        name: s.name_2,
        avatar: s.avatar_2,
        location: s.location_2,
        bio: s.bio_2,
        twitter: s.twitter_2,
        url: s.url_2,
        organization: s.organization_2
      }
    ].filter(x => x.name !== null);
  })
  .flat()
  .map((speaker, index) => {
    var snakeCaseName = _.snakeCase(speaker.name);
    var fileName = `outputs/${snakeCaseName}.jpg`;
    var photoUrl = `/images/speakers/${snakeCaseName}.jpg`;
    var country = speaker.location === "Unknown" ? "" : speaker.location;
    download(speaker.avatar, fileName);
    return {
      [snakeCaseName]: {
        name: speaker.name,
        bio: speaker.bio,
        company: speaker.organization,
        country: country,
        features: false,
        photo: photoUrl,
        photoUrl: `${baseUrl}${photoUrl}`,
        order: 2 + index
      }
    };
  })
  .reduce((acc, obj) => {
    return { ...acc, ...obj };
  });

fs.writeFileSync("outputs/speakers.json", JSON.stringify(speakers, null, 2));
