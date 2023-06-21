export default function (plop) {
	// controller generator
	plop.setGenerator('module', {
		description: 'create application module with its file',
		prompts: [{
			type: 'input',
			name: 'name',
			message: 'Enter module name :'
		}],
		actions: [{
			type: 'add',
			path: 'app/modules/{{kebabCase name}}/{{kebabCase name}}.controller.ts',
			templateFile: 'plop-templates/controller.template.hbs'
		}, {
    type: 'add',
    path: 'app/modules/{{kebabCase name}}/{{kebabCase name}}.module.ts',
    templateFile: 'plop-templates/module.template.hbs'
  },{
    type: 'add',
    path: 'app/modules/{{kebabCase name}}/{{kebabCase name}}.service.ts',
    templateFile: 'plop-templates/service.template.hbs'
  },]
	});
};