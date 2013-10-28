
build: components index.js
	@./node_modules/.bin/component build -s fsSuperagent -o assets/js -n fs-superagent
	@./node_modules/.bin/component-global -f ./assets/js/fs-superagent.js

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
