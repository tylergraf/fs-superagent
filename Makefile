
build: components index.js
	@component build --dev -s fsSuperagent

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
