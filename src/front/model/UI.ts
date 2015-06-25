module OctoBoot.model {

    export class UI {

        public static MAIN_CONTAINER: string = '.pusher';

        public static HB_PROFIL: string = 'Profil.hbs';
        public static HB_REPOS: string = 'Repos.hbs';
        public static HB_SIDEBAR: string = 'Sidebar.hbs';
        public static HB_TOOLSBAR: string = 'Toolsbar.hbs';
        public static HB_STAGE: string = 'Stage.hbs';
        public static HB_NEW_REPO: string = 'NewRepo.hbs';
        public static HB_ALERT: string = 'Alert.hbs';

        public static SIDEBAR_LAUNCH_BT: string = '.Toolsbar .sidebar';

        public static LOGIN_TITLE: string = 'OctoBoot <-> GitHub';
        public static LOGIN_BODY: string = 'Sorry, you have to be connected with your GitHub account in order to use OctoBoot. Click on the connect button OR if it\'s your first time allow OctoBoot access on your GitHub account';

        public static REPO_ALERT_CONVERT_TITLE: string = 'Not a OctoBoot project';
        public static REPO_ALERT_CONVERT_BODY: string = 'Sorry, it seems that your project are not a OctoBoot project, did you want to convert it ?';
    }
}
