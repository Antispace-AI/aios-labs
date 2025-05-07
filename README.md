<div align="center">
<!-- <picture>
  <img alt="antispace" media="(prefers-color-scheme: light)" src="/docs/antispace.svg" width="50%" height="auto">
</picture> <br/><br/> -->
<!-- <picture>
  <img alt="antispace" media="(prefers-color-scheme: light)" src="/docs/aios.svg" width="10%" height="auto">
</picture><br/>
<picture>
  <img alt="aios labs" media="(prefers-color-scheme: light)" src="/docs/app.svg" width="22%" height="auto">
</picture>   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<picture>
  <img alt="aios labs" media="(prefers-color-scheme: light)" src="/docs/lab.svg" width="22%" height="auto">
</picture><br/><br/> --> 
<picture>
  <img alt="antispace" media="(prefers-color-scheme: light)" src="docs/aios.svg" width="10%" height="auto">
</picture>
<br/>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/app.svg">
  <img alt="aios labs" media="(prefers-color-scheme: light)" src="docs/app-light.svg" width="22%" height="auto">
</picture>
<br/>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/lab.svg">
  <img alt="aios labs" media="(prefers-color-scheme: light)" src="docs/lab-light.svg" width="22%" height="auto">
</picture>
<br/>
<br/>

The World's First Artificially Intelligent Operating System, maintained by [Antispace](https://anti.space).

<h3>
  
[Homepage](https://anti.space) | [Documentation](https://docs.anti.space/) | [Twitter](https://x.com/antispaceAI) | [Discord](https://discord.gg/64XZqNU6JF)

</h3>
</div>

---

This may not seem like any traditional operating systems, but it is an operating system [built on the web]. 

This repo allows you to build and deploy powerful AI applications with minimal effort. These apps function as a new unlock to the skill tree of your AI in the AIOS, and talk with the custom AI personality you created in the Antispace.

This repository contains all apps available in the [Antispace AIOS Labs](https://anti.space/lab). It includes documentation and examples of how to extend Antispace using our modern development framework.

## Features
The core Antispace features are located [here](https://anti.space/features) and additional here are the [aios labs docs](https://docs.anti.space) to build with the antispace cli.

## Contributing
<!-- 
There has been a lot of interest in antispace lately. Following these guidelines will help your PR get accepted.
 -->
You can create new power sets into the Antispace AIOS system, here are some notes and bounties that might help on your journey.

We'll start with what will get your PR closed with a pointer to this section:
- No code golf! While low line count is a guiding light of this project, anything that remotely looks like code golf will be closed. The true goal is reducing complexity and increasing readability, and deleting \ns does nothing to help with that.
- All docs and whitespace changes will be closed unless you are a well-known contributor. The people writing the docs should be those who know the codebase the absolute best. People who have not demonstrated that shouldn't be messing with docs. Whitespace changes are both useless and carry a risk of introducing bugs.
- Anything you claim is a "speedup" must be benchmarked. In general, the goal is simplicity, so even if your PR makes things marginally faster, you have to consider the tradeoff with maintainability and readability.
- If your PR looks "complex", is a big diff, or adds lots of lines, it won't be reviewed or merged. Consider breaking it up into smaller PRs that are individually clear wins. A common pattern I see is prerequisite refactors before adding new functionality. If you can (cleanly) refactor to the point that the feature is a 3 line change, this is great, and something easy for us to review.
- For character creations if your character is used by more than 20 people you will get a bounty of 5$. If it is used by more than 100 people you will get a bounty of 20$. If it is used by more than 10000 people you will get a bounty of 100$ or more.
Now, what we want:

- Bug fixes (with a regression test) are great! This library isn't 1.0 yet, so if you stumble upon a bug, fix it, write a test, and submit a PR, this is valuable work.
- Solving bounties! Antispace [offers cash bounties](https://docs.google.com/spreadsheets/d/1-PbP6IwWgx0jXhpSDgni8c_k0t055KBbwXeNE_mJkhs/edit?usp=sharing) for certain improvements to the library. All new code should be high quality and well tested.
- Features. However, if you are adding a feature, consider the line tradeoff. If it's 3 lines, there's less of a bar of usefulness it has to meet over something that's 30 or 300 lines. All features must have regression tests. In general with no other constraints, your feature's API should match torch or numpy.
- Refactors that are clear wins. In general, if your refactor isn't a clear win it will be closed. But some refactors are amazing! Think about readability in a deep core sense. A whitespace change or moving a few functions around is useless, but if you realize that two 100 line functions can actually use the same 110 line function with arguments while also improving readability, this is a big win. Refactors should pass [process replay](#process-replay-tests).

## Antispace Lore
You can expect the similar level of proficiency from the [vercel folks](https://github.com/vercel) as we have several of them at Antispace.

We keep some things, like the core AIOS algorithm, _deliberately_ private to keep an edge on the corpo-spies that wanted to buy us out or the noob competitors who tried to brain-rape a year ago. However, as a frame of reference you can think of Antispace working similar to [this](https://x.com/karpathy/status/1723140519554105733?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1723140519554105733%7Ctwgr%5Eafeded018909f97cd262a3bea79519ea5861f7db%7Ctwcon%5Es1_&ref_url=https%3A%2F%2Fcdn.embedly.com%2Fwidgets%2Fmedia.html%3Ftype%3Dtext2Fhtmlkey%3Da19fcc184b9711e1b4764040d3dc5c07schema%3Dtwitterurl%3Dhttps3A%2F%2Ftwitter.com%2Fkarpathy%2Fstatus%2F17231405195541057333Fs3D4626t3DuuEcj3Up_XwhDshmNCpLBQimage%3Dhttps3A%2F%2Fabs.twimg.com%2Ferrors%2Flogo46x38.png). In practice, however, we believe our solution to be far more powerful. 

We aim to make the Antispace AIOS much more powerful than Linux in impact, whilst never letting the world run on an inferior system like Windows.

## Getting Started

Visit [https://docs.anti.space](https://docs.anti.space) to get started with our CLI. If you want to discover and install apps, check out [our App Lab](https://anti.space/apps).

Be sure to read and follow our [Community](https://anti.space/community) and [App Development](https://docs.anti.space/app-development) guidelines when submitting your app and interacting with other developers in this repository.

## Feedback

Antispace wouldn't be where it is without the feedback from our community, so we would be happy to hear what you think of the API / development experience and how we can improve. Please use [GitHub issues](https://github.com/antispace/app-lab/issues/new/choose) for everything API related (bugs, improvement suggestions, developer experience, docs, etc). We have a few [templates](https://github.com/Antispace-AI/aios-labs/tree/main/examples) that should help you get started.

## Community

Join our [Discord community](https://discord.gg/64XZqNU6JF) to share your app, debug challenging issues, or simply get to know like-minded developers.
