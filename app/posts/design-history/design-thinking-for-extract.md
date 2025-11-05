---
layout: post
title: Initial design thinking for Extract
description: Capturing the first few weeks of design work in the Extract team
date: 2025-11-05
author: Fabia Fowler
---

## What is Extract anyway?
Extract uses AI (in particular, Google Gemini and Meta’s Segment Anything Model or 'SAM') to extract text and polygons from pdfs. ==The data that we want to extract from pdfs lie in Article 4’s, Tree preservation orders and Conservation areas==. Think old paper documents that are at the back of a filing cabinet just waiting to be turned into data. Extract aims to significantly reduce the amount of time LPAs spend on the converting process, without compromising on accuracy.

## In the beginning, there was a prototype...
Being asked to join the Extract team is a unique and exciting situation. Unique, because the technology is already being created by the i.AI team, along with a prototype to show how it works. Exciting because it needs to move fast! We have a deadline which has been shared by Keir Starmer in a [recent press release](https://www.gov.uk/government/news/pm-unveils-ai-breakthrough-to-slash-planning-delays-and-help-build-15-million-homes-6-june-2025) ==“Extract is expected to be made available to all councils by Spring 2026”==. No pressure.

The work for the design team is to unpick where we’ve got to so far. We will be receiving the technology from i.AI but we need a front-end to the service that is designed for our users, not the technology. That means logging and mapping our assumptions about the project, looking at the tools users already use to extract information (albeit manually) and making sure we are delivering value where users need it most.

## Getting on the same page
So far, there's been three iterations of user journyes with many more to come...

### 1) Rough whiteboarding
Jenny (PM) and I separated the ==technical stages of extract==, annotating what we know and don’t know. This was great to put pen to paper and onboard onto the project.

![Step by step whiteboard exercise for Extract](/design-history/initial-design-thinking-for-extract/White-boarding.png)


### 2) The first user flow 
I shared an idea of ==how these stages could become UI==, and reviewed it with Steve, Jenny and Owen - making sure that we were all on the same page before a team day in London where we interrogated it further.

![A simple user flow showing how a user accesses Extract and simple UI that could map to each page](/design-history/initial-design-thinking-for-extract/User-flow-1.png) 


### 3) The second service map - now its getting complicated 
This flow has been reviewed by the full team (including i.AI) and again with UCDers from Digital Planning and brought on lots of useful debate and discussion. Post i.AI’s review, ==I realised that we could use features from the Segment Anything Model== by Meta to improve image extraction. We’re now getting to the point where theres multiple ways to do the same thing. ==Which version we build lies in hours of user research.==

![A service design showing how features work together to create a user journey](/design-history/initial-design-thinking-for-extract/User-flow-2.png) 


## Gathering our patterns
Like a hyped-up seamstress who’s been asked to create a look last-minute, ==we are quickly looking around to see what patterns we can re-use, what material is already cut and speaking to colleagues across the sector to see how they’ve tackled similar problems.== 

This has resulted in a playground of map-drawing screenshots from HMLR and MOJ, branching out to private sector products like Rightmove, Idox’s Uniform (a back office planning system that has a web map) and ArcGIS pro (a tool that has map drawing features like pdf overlays). We’ve also been given access to some handy prototypes to see how these work in live, giving us the head-start we need!



## What we’ve learnt
### How Extract operates
There seems to be 3 stages that come together to create accurate geo-spatial data
1) Locating where the map is in the uploaded pdf
2) Correctly geo-referencing the map in a pdf to an OS map
3) Extracting drawn polygons and placing that onto a geo-referenced map (by referencing its placement on the original map)

### How users and AI can work together to improve the extracted data
The 3 stage process means that there are multiple ways to improve an extraction if it’s come from a low-quality scan, and we _could_ implement Segment Anything’s feature base as well as standard ‘edit points on a map’. ==Features like retracing a polygon, removing fuzziness or identifying whats inside and outside a shape (think background eraser or magic wand tools in photoshop) could be possible== with enough time and scope. 

We assume that editing an extracted polygon could be the most frustrating stage for users - but more importantly, we need to test these kinds of assumptions to make sure we’re focussing our effort on the right thing.

## What we’ll do next
We’ll be going through user’s current journeys to see how users currently extract and digitise geospatial data. We’ll do this by looking at the tools they already use and taking a seat in research sessions.

The low-fidelity designs will be raised into options we can prototype and test even further. ==Prototyping should be quick and scrappy - we expect to throw away a lot whilst learning a lot too!==