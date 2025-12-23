---
layout: post
title: Meetings and partings
description: This week was all about analysing the evidence that came out of research, looking at the findings, forming insights, and putting the project on ice for over the festive period. So, what did we learn? 
date: 2025-12-23
author: Steve Messer
---

Another short weeknote. This week was all about analysing the evidence that came out of research, looking at the findings, forming insights, tying up loose ends, and putting the project on ice for over the festive period. The team has earned a break to say the least.

As previously mentioned, we’re going to continue the alpha phase in January to gather more evidence. We’ve tested two prototypes with eight users from seven local authorities but don’t feel like we’ve got conclusive evidence just yet. Collecting more will help us learn whether we can effectively meet users’ needs.

So, what were the key findings and insights?

## What we learned

### Georeferencing is the foundation

Overwhelmingly, users found Extract’s ability to look at old maps and locate the same place on a current map hugely helpful. This is known as georeferencing and is the most important part of creating geospatial data from documents. It’s also the hardest and most time-consuming job when working with historical maps. If you’re looking at an old map and a piece of land is developed or a track is turned into a junction, it can be hard to work out where it is on a newer map. 

Some quotes from users involved in testing show you how foundational a job it is for turning old maps into data.

> The first stage is to get it right with the georeferencing. That is the foundation. So if you get it wrong with that, there’s a 95% chances of you getting it completely wrong when it comes to the spatial position and accuracy of the feature itself.

> Georeferencing and digitising is complex work, so this can help people.

> Auto-georeferencing is good because that’s a cumbersome process.

Some users mentioned wanting to get this feature into their own GIS tools, so we’re looking into GeoTIFFs – a way of embedding geographic metadata into images. Our understanding is that this may let users draw shapes in their own tools, so it’s an alternative solution we’ll start prototyping in the new year.

### Bringing colleagues along

Despite that, we also heard that from users that they’d like to invite others to work on digitising documents with them. Geospatial information system (GIS) officers are in high demand at local authorities and often work across many service areas. As a result, they’re stretched across many projects and may not always have the time to spend on lengthy projects – like digitising historical planning information, for example.

Users suggested that Extract might help create efficiencies at local authorities by allowing GIS officers to pass some digitisation work to colleagues without GIS skills, allowing the GIS officer to ‘sign off’ anything produced by their colleagues.

### Accuracy of shapes is very important

Users also said that the accuracy of the shapes outputted was paramount. Few users found the shapes drawn by the AI agentic workflow to be satisfactory enough to adopt, and many users redrew the shapes themselves. There’s an opportunity to look into whether we can encourage the model to produce more ‘regular’ shapes or with fewer points, to increase accuracy and user satisfaction.

That’s just a couple of insights from a wealth of findings, but it’s enough for us to pause and consider the next steps carefully.

## Challenging preconceived assumptions

Stepping back from it all, it’d be sensible to [reframe the problem](https://www.designreview.byu.edu/collections/design-thinking-part-4-framing-and-reframing-design-problems) and truly understand its scale. From what we’ve heard from users, not all local planning authorities need to convert documents in order to prepare or provide data to national standards. Some times they already have data but it’s patchy, and some times it’s just hard to find the time to transform it from one schema to another.

These details affect not only how we design and build Extract, but also how we launch it and onboard users. Ultimately it’s about making sure we [learn about users and their needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs) so that we can build the right thing.

## That’s a wrap...for now

It’s been a hugely exciting year though. This time last year, extracting data from documents using AI was just an idea, but we’ve developed a novel method to do it with multimodal large language models. 

As mentioned earlier, the team have properly earned their break over the next couple of weeks, and we’re really looking forward to starting up again in January.

Anyway, now onto my speech, my Christmas speech: [Thank you, all, and Merry Christmas](https://www.youtube.com/watch?v=paSUlf4rCpA).