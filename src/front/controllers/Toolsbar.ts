/// <reference path="Handlebar.ts" />
/// <reference path="Templates.ts" />
/// <reference path="Stage.ts" />
/// <reference path="../core/Socket.ts" />

module OctoBoot.controllers {

    export class Toolsbar extends Handlebar {

        public templates: Templates;
        
        public createHandlers: model.HTMLEvent = {
            click: () => this.create()
        };
        
        public saveHandlers: model.HTMLEvent = {
            click: () => this.save()
        };

        constructor(public projectName: string, public stage: Stage, public repoUrl: string) {
            super(model.UI.HB_TOOLSBAR);
            this.initWithContext(this, this.stage.jDom);

            this.templates = new Templates(this.projectName, this.stage);

            $('.Sidebar').sidebar('attach events', this.jDom.children('.Settings'));

            core.Socket.io.on('404', () => this.setItemActive('New'));
            core.Socket.io.on('save_available', () => this.setItemActive('Save'));
        }

        private create(): void {
			this.templates.show();
        }

        private save(): void {
            var save: JQuery = this.jDom.find('.save.icon').removeClass('save').addClass('spinner loading');
            core.Socket.emit('save', { name: this.projectName, url: this.repoUrl }, () => {
                save.removeClass('spinner loading').addClass('save');
                this.setItemActive('Publish');
            });
        }

        private setItemActive(wich: string): void {
            this.jDom.children('.item.active').removeClass('active');
            this.jDom.children('.item.' + wich).addClass('active');
        }

    }
}
