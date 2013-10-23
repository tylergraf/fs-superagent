
build: components index.js
	@./node_modules/.bin/component build -s fsSuperagent -o assets/js -n fs-superagent -g

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
