webpackJsonp([0x9eea3b0a0b15],{460:function(e,a){e.exports={data:{markdownRemark:{html:'<h2 id="how-we-build"><a href="#how-we-build" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>How we build</h2>\n<p>Applications are built, tested and verified in our custom Jenkins CI/CD pipeline. They are then passed on to the proprietary CustomBuilder, Architect, as zip files called DeliveryBundles. A DeliveryBundle contains the application files and metadata.</p>\n<p>Builds are triggered in one of several ways;</p>\n<ul>\n<li>via the CI/CD pipeline from commits tagged as <a href="/documentation/openshift/#deployment-and-patching-strategy">semanic releases</a> or as feature branch SNAPSHOTS.</li>\n<li>as a binary-build directly from a development machine. This will buypass Jenkins and read the DeliveryBundle from stdin.</li>\n<li>from ImageChange triggers when either the CustomBuilder or the Base Image changes. See our <a href="/documentation/openshift/#deployment-and-patching-strategy">patching strategy</a>.</li>\n</ul>',headings:[{value:"How we build",depth:2}],fields:{slug:"/frontpage/build/"},frontmatter:{title:""}}},pathContext:{slug:"/frontpage/build/"}}}});
//# sourceMappingURL=path---frontpage-build-32894fdf37a1bf64c352.js.map