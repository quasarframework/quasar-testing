title: Code Quality
---

<a href="https://github.com/GoogleChrome/lighthouse">
    <img alt="Tested with Lighthouse" src="https://img.shields.io/badge/tested with-Lighthouse-2fa4cf.svg">
</a>

You :heart: your code, but does Google? Many different parts of the Quasar stack directly or indirectly leverage Google products, such as Cordova for Android, Electron (which uses Chromium as a web-view), Material Design as UX paradigm and probably more than a few dependencies. Our guess is that more than half of the people reading this also use Chrome for their development workflow... 

Testing code quality against the exact metrics that Google optimizes for and actually sniffs is a really great way to not only squeeze extra performance out of your app, but also to follow best practices and get better SEO results - which can actually make or break the success of your app. Here you can get [introduced to Lighthouse](https://developers.google.com/web/tools/lighthouse), take a deep-dive into its [architecture and terminology](https://github.com/GoogleChrome/lighthouse/blob/master/docs/architecture.md) and finally make sure to read their [document about scoring](https://github.com/GoogleChrome/lighthouse/blob/master/docs/scoring.md). Did we mention that Paul Irish is involved in the development of Lighthouse? Nice!

### TIP
> Install Lighthouse globally and use it religiously as a soft dependency in your workflow before you enter production. Although it will work if you point it at your dev server, don't be surprised if the performance metrics are scary. You should always run it from a built package!

## Flags and options
```bash
      LIGHTHOUSE FLAGS
      --url, -r           Use this url for testing (needed by Lighthouse)
      --view, -v          Load into the browser
      --config, -g        Which config.js to load
      
      LIGHTHOUSE CLI
      --lighthouse, -l    Analyse site with Lighthouse CLI (requires a global install)
      --yes, -y           Overwrite results (instead of using a timestamp)
      
      LIGHTHOUSE NODE
      --quality, -q       Call Lighthouse with node bindings
```


There are two methods of running Lighthouse, both of which have their respective advantages:

## Lighthouse as a global dependency

This example mode requires that you install lighthouse globally, and runs Lighthouse as a CLI interface. 
```bash
$ yarn global add lighthouse
``` 

The following command will run lighthouse and create a very detailed report for you, which will be placed in `/test/lighthouse/reports`. This report will be automatically opened in your browser. 
```bash
$ quasar test --lighthouse --url "http://localhost:8080"
```

By default we have chosen to give you EVEN more information than is the default setting, but if you want to quiet down your reports, you can use one of the other ones provided or even roll your own. The following command will save the rendered html file to the build/lighthouse/ folder and overwrite it each time.

```bash
$ quasar test --lighthouse --url "http://localhost:8080" -o "./test/quality/configs/custom-config.js" -p "./build/lighthouse/" -y
```

If you wanted, you could put this in a pre-commit git hook, for example. But then, you would probably do a whole bunch of other things first, like start a real server on your development box that serves the built assets and run lighthouse on that.

#### INFO
> By the way, lighthouse as it is installed in quasar-cli will run on any site that is accessible via http, so you can easily compare your site with another site to get a feeling for how things benchmark against each other. Maybe you'd even like to submit your benchmarks to compare with other Quasar users? Talk to us about it.


## Lighthouse within node

This mode will run metrics within node that you can specify in your configuration file. This might also be a method that you could consider integrating in your build pipeline, as in run the test, and if some metric is failing or below a certain level then fail the build... The possibilities are endless, and it is a good thing that you were so fast in making your app - now you have time to tune it!

```bash
$ quasar test --quality --url "https://localhost:8080"
```


Speaking of which, you might even be asking yourself why we went to the trouble of integrating Lighthouse here when you could just as easily use it as a global tool. While this is true, being able to control its configuration as a globally available module is not really trivial, and this way you can use it - or ignore it. (But having it always on hand will definitely save your day someday!)

Also, because it is a full-fledged resident of your cli, you can also do really doing cool stuff by creating your own custom Lighthouse parser and calling it like this:

```bash 
# Publish the results to github as a gist. You'll need to either use 
# a password or have a token with Gist scope for this to work...

$ quasar test -q custom -r "https://quasar-framework.org" /
  | bash ./test/bin/create-gist.sh - $USERNAME $ACCESSTOKEN
```

And here is a link to a [Travis-CI](https://github.com/ebidel/lighthouse-ci) wrapper for Lighthouse that you could look into using...


By the way, we are using Lighthouse internally at Quasar to help make sure that the artifacts built by the framework come as close as possible to perfect scores. If you have a suggestion that helps improve the metrics here, please reach out! If you have an awesome recipe you want to share with us, please do it. And if this just made you cry, sorry about that. Now get in there and make the web better!