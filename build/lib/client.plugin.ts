'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
const { Compilation } = require('webpack');
const hash = require('hash-sum');
const uniq = require('lodash.uniq');

const isJS = (file) => /\.js(\?[^.]+)?$/.test(file);
const isCSS = (file) => /\.css(\?[^.]+)?$/.test(file);

class VueSSRClientPlugin {
	options: {
		filename: string;
		[propName: string]: any;
	};
	constructor(options: object = {}) {
		this.options = Object.assign(
			{
			filename: 'vue-ssr-client-manifest.json'
			},
			options
		);
	}

	apply(compiler) {
		const this$1 = this;
		// Hook into compiler right before compilation is sealed so we get full stats object
		compiler.hooks.make.tap('vue-client-plugin', (compilation) => {
			compilation.hooks.processAssets.tap(
				{
					name: 'generate-client-manifest',
					stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
				},
				() => {
					const stats = compilation.getStats().toJson();
					const allFiles = uniq(stats.assets.map((a) => a.name));
					const initialFiles = uniq(
						Object.keys(stats.entrypoints)
						.map((name) => stats.entrypoints[name].assets)
						.reduce((assets, all) => {
							return all.concat(assets);
						}, [])
						.filter(({ name }) => isJS(name) || isCSS(name))
						.map(({ name }) => name)
					);
					const asyncFiles = allFiles
						.filter((file) => isJS(file) || isCSS(file))
						.filter((file) => initialFiles.indexOf(file) < 0);
					const manifest = {
						publicPath: stats.publicPath,
						all: allFiles,
						initial: initialFiles,
						async: asyncFiles,
						modules: {
						/* [identifier: string]: Array<index: number> */
						}
					};
					const assetModules = stats.modules.filter((m) => m.assets.length);
					const fileToIndex = (file) => manifest.all.indexOf(file);

					stats.modules.forEach((m) => {
					if (m.chunks.length === 1) {
						const cid = m.chunks[0];
						const chunk = stats.chunks.find((c) => c.id === cid);

						if (!chunk || !chunk.files) {
						return;
						}
						const id = m.identifier.replace(/\|.*/, '').split('!').pop(); /* use only 'base' filepath */
						const files = (manifest.modules[hash(id)] = chunk.files.map(
						fileToIndex
						));

						assetModules.forEach((m) => {
						if (m.chunks.some((id) => id === cid)) {
							/* eslint-disable */
							files.push.apply(files, m.assets.map(fileToIndex));
						}
						});
					}
					});
					const json = JSON.stringify(manifest, null, 2);
					compilation.assets[this$1.options.filename] = {
					source: function() {
						return json;
					},
					size: function() {
						return json.length;
					}
					};
				}
			);
		});
	}
}

export default VueSSRClientPlugin;
