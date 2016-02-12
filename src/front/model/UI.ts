module OctoBoot.model {

    export class UI {

        public static MAIN_CONTAINER: string = '.pusher';

        public static HB_PROFIL: string = 'Profil.hbs';
        public static HB_REPOS: string = 'Repos.hbs';
        public static HB_SIDEBAR: string = 'Sidebar.hbs';
        public static HB_TOOLSBAR: string = 'Toolsbar.hbs';
        public static HB_STAGE: string = 'Stage.hbs';
        public static HB_ALERT: string = 'Alert.hbs';
        public static HB_TEMPLATES: string = 'Templates.hbs';
        public static HB_EDITBAR: string = 'EditBar.hbs';
        public static HB_EDITBAR_FRAME: string = 'EditBarFrame.hbs';
        public static HB_EDITBAR_IFRAME_OVERLAY: string = 'EditIframeOverlay.hbs';
        public static HB_VERTICAL_LINE: string = 'VerticalLine.hbs';
        public static HB_HORIZONTAL_LINE: string = 'HorizontalLine.hbs';

        public static SIDEBAR_LAUNCH_BT: string = '.Toolsbar .sidebar';

        public static LOGIN_TITLE: string = 'OctoBoot <-> GitHub';
        public static LOGIN_BODY: string = 'Sorry, you have to be connected with your GitHub account in order to use OctoBoot. Click on the connect button OR if it\'s your first time allow OctoBoot access on your GitHub account';

        public static REPO_ALERT_NEW_BODY: string = 'Cool ! It\'s a greet idea ! Give me a name for your new project please:';
        public static REPO_ALERT_CONVERT_TITLE: string = 'Not a OctoBoot project';
        public static REPO_ALERT_CONVERT_BODY: string = 'Sorry, it seems that your project are not a OctoBoot project, did you want to convert it ?';

        public static PUBLISH_ALERT_TITLE: string = 'Publish your website online';
        public static PUBLISH_ALERT_BODY: string = 'Are you sure ? This will update your website online with your current working version';

        public static DELETE_FILE_ALERT_TITLE: string = 'Delete file';
        public static DELETE_FILE_ALERT_BODY: string = 'you are going to remove [FILE] - Are you sure about this ?';

        public static DELETE_PROJECT_ALERT_TITLE: string = 'Delete project';
        public static DELETE_PROJECT_ALERT_BODY: string = 'Delete [PROJECT] - Are you sure about this ? please type the project name to confirm the deletion';
    }
}
