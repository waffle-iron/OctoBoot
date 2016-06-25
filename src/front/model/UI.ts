module OctoBoot.model {

    export class UI {

        public static MAIN_CONTAINER: string = '.pusher'

        public static HB_PROFIL: string = 'Profil.hbs'
        public static HB_REPOS: string = 'Repos.hbs'
        public static HB_SIDEBAR: string = 'Sidebar.hbs'
        public static HB_TOOLSBAR: string = 'Toolsbar.hbs'
        public static HB_STAGE: string = 'Stage.hbs'
        public static HB_ALERT: string = 'Alert.hbs'
        public static HB_EDITBAR: string = 'EditBar.hbs'
        public static HB_EDITBAR_FRAME: string = 'EditBarFrame.hbs'
        public static HB_EDITBAR_IFRAME_OVERLAY: string = 'EditIframeOverlay.hbs'
        public static HB_VERTICAL_LINE: string = 'VerticalLine.hbs'
        public static HB_HORIZONTAL_LINE: string = 'HorizontalLine.hbs'

        public static SIDEBAR_LAUNCH_BT: string = '.Toolsbar .sidebar'

        public static LOGIN_TITLE: string = 'Log In'
        public static LOGIN_BODY: string = 'Hi ! Good to see you ! you have to be connected with your GitHub account in order to use OctoBoot. Click on the connect button'

        public static REPO_ALERT_NEW_BODY: string = 'Cool ! It\'s a greet idea ! Give me a name for your new website please:'

        public static PUBLISH_ALERT_TITLE: string = 'Publish your website online'
        public static PUBLISH_ALERT_BODY: string = 'Are you sure ? This will update your website online with your current working version'

        public static DELETE_FILE_ALERT_TITLE: string = 'Delete file'
        public static DELETE_FILE_ALERT_BODY: string = 'you are going to remove [FILE] - Are you sure about this ?'

        public static DELETE_PROJECT_ALERT_TITLE: string = 'Delete website'
        public static DELETE_PROJECT_ALERT_BODY: string = 'Delete [PROJECT] - Are you sure about this ? please type the website name to confirm the deletion'

        public static EDIT_MOVE_TITLE: string = 'Move element'
        public static EDIT_MOVE_BODY: string = 'Press you keyboard UP and DOWN button to move your element in his parent'

        public static EDIT_IMG_TITLE: string = 'Update image url and alternate text'
        public static EDIT_IMG_BODY: string = 'You can select an image from your project OR type an external http url OR leave blank if you just want to update alternate text (usefull for referencement)'

        public static EDIT_MARK_DUPLICATE_TITLE: string = 'Mark as duplicable'
        public static EDIT_MARK_DUPLICATE_BODY: string = 'This element is now on the duplicable list'
        public static EDIT_MARK_DUPLICATE_RESET_BODY: string = 'Warning ! This element is already on the duplicable list, did you want to remove from it ?'
    }
}
