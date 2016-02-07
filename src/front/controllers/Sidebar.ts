/// <reference path="../core/Repos.ts" />
/// <reference path="../core/Template.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../controllers/CreateTemplate.ts" />
/// <reference path="Handlebar.ts" />
/// <reference path="Alert.ts" />

module OctoBoot.controllers {

    export class Sidebar extends Handlebar {

        public selected: core.Repos;
        public template: core.Template;
        public user: model.GitHubUser;
        public repos_public: Array<model.GitHubRepo>;
        public repos_private: Array<model.GitHubRepo>;
        public repo_template: model.GitHubRepo;

        constructor() {
            super(model.UI.HB_SIDEBAR);
            this.initWithContext(null).sidebar({ closable: false }).sidebar('setting', 'transition', 'push').sidebar('hide');
        }

        public update(): void {
            this.repo_template = null;
            this.jDom.sidebar('show');
            core.GitHub.getUser((user: model.GitHubUser) => {
                this.user = user;
                helper.HandlebarHelper.updateTemplate(model.UI.HB_PROFIL, user);

                core.GitHub.getRepos(model.RepoType.PUBLIC, (repos: Array<model.GitHubRepo>) => { this.repos_public = repos; this.update_view_repo(model.RepoType.PUBLIC, repos) });
                core.GitHub.getRepos(model.RepoType.PRIVATE, (repos: Array<model.GitHubRepo>) => { this.repos_private = repos; this.update_view_repo(model.RepoType.PRIVATE, repos) });

                this.update_view_template()
            })
        }

        private update_view_repo(type: string, repos: Array<model.GitHubRepo>): void {
            var formatedType: string = type.charAt(0).toUpperCase() + type.slice(1);
            helper.HandlebarHelper.updateTemplate(model.UI.HB_REPOS, {
                titleHandlers: this.handlers_title(),
                repoHandlers: this.handlers_repo(type),
                newHandlers: this.handlers_new_repo(type),
                repos: repos.filter((repo: model.GitHubRepo) => { return !!repo.owner.login.match(this.user.login) && !repo.name.match(model.ServerAPI.TEMPLATE_REPO_NAME) }), // filter by owner
                title: formatedType
            }, 'Repos' + formatedType);

            this.check_for_template(repos);
        }

        private update_view_template(dir?: model.GitHubTree): void {
            helper.HandlebarHelper.updateTemplate(model.UI.HB_REPOS, {
                titleHandlers: this.handlers_title(),
                repoHandlers: this.handlers_template(),
                newHandlers: this.handler_new_template(),
                repos: dir ? dir.tree.map((sub: model.GitHubTreeFile) => { sub.name = sub.path; return sub }) : [],
                title: 'Template'
            }, 'ReposTemplates');
        }

        private check_for_template(repos: Array<model.GitHubRepo>): void {
            repos.forEach((repo: model.GitHubRepo) => {
                if (repo.owner.login.match(this.user.login) && repo.name === model.ServerAPI.TEMPLATE_REPO_NAME && !this.repo_template) {
                    this.repo_template = repo;
                    core.GitHub.getTree(repo.name, (dir: model.GitHubTree) => this.update_view_template(dir));
                    core.GitHub.cloneOnServer(repo.name, repo.clone_url, (error: string) => {
                        if (error) {
                            new Alert({ title: 'Error during refresh of template project', body: error, onApprove: core.Socket.reset})
                        }
                    });
                }
            })
        }

        private handlers_title(): model.HTMLEvent {
            return { click: function() { $(this).parent().children('.menu').slideToggle(500) } }
        }

        private handlers_repo(type: string): model.HTMLEvent {
            var __this = this;
            return { click: function(e: MouseEvent) { __this.select_repo(__this, this, type, $(e.target).hasClass('trash')) } }
        }

        private handlers_new_repo(type: string): model.HTMLEvent {
            return { click: () => { this.select_repo(this, null, type) } }
        }

        private handlers_template(): model.HTMLEvent {
            var __this = this;
            return { click: function() { __this.select_template(__this, this) } }
        }

        private handler_new_template(): model.HTMLEvent {
            return {
                click: () => {
                    let template: CreateTemplate = new CreateTemplate(
                        this.repo_template,
                        () => { // done
                            this.repo_template = this.repo_template || template.repo;
                            core.GitHub.getTree(this.repo_template.name, (dir: model.GitHubTree) => this.update_view_template(dir))
                        }
                    )
                }
            }
        }

        private select_template(__this: Sidebar, button: HTMLElement): void {
            __this.jDom.sidebar({ closable: true });
            __this.clean_selected();

            __this.template = new core.Template(button.innerText || button.innerHTML.trim(), this.repo_template.clone_url, button);
        }

        private select_repo(__this: Sidebar, button: HTMLElement, type: string, trash:boolean = false): void {
            var project_name: string = button ? button.innerText || button.innerHTML.trim() : null;

            if (trash) {
                // user click on trash icon
                var trashAlert: Alert = new Alert({
                    title: model.UI.DELETE_PROJECT_ALERT_TITLE,
                    body: model.UI.DELETE_PROJECT_ALERT_BODY.replace('[PROJECT]', project_name),
                    input: 'project name to delete',
                    onApprove: () => {
                        if (trashAlert.getInputValue() === project_name) {
                            trashAlert.setWait()
                            // remove github remote repository
                            core.GitHub.deleteRepo(project_name, () => {
                                // remove local folder
                                core.Socket.emit(model.ServerAPI.SOCKET_REMOVE_DIR, { name: project_name }, () => {
                                    // need to wait a little for ghapi to be updated
                                    setTimeout(() => {
                                        trashAlert.hide();
                                        this.update();
                                    }, 3000)
                                })
                            })
                        }
                        // prevent alert closing on button click
                        return false;
                    },
                    onDeny: () => {}
                })
            } else {
                // else user click on repo, so select it
                __this.jDom.sidebar({ closable: true });
                __this.clean_selected();

                __this.selected = new core.Repos(
                    project_name,
                    button ? button.getAttribute('data-url') : null,
                    type,
                    button ? button : null)

                // if no button, it's a repo creation
                if (!button) {
                    __this.selected.onCreate = (name: string, url: string) => {
                        // update sideBar repo on new project
                        this.update();

                        // fill missing sidebarButton to change button state
                        // ugly timeout .. 
                        setTimeout(() => {
                            __this.selected.sidebarButton = $('.Repos' + type.charAt(0).toUpperCase() + type.slice(1)).find('.repo' + name).get(0);
                        }, 3000)
                    }
                }   
            }
        }

        private clean_selected(): void {
            if (this.selected) {
                this.selected.destroy();
            }
            if (this.template) {
                this.template.destroy();
            }

        }
    }
}
