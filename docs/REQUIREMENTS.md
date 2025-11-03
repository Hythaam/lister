# Lister Usage Guide

A comprehensive task and list management application that allows users to create, manage, and collaborate on gift lists. The core differentiator is that users cannot see comments on the items within lists that they own.

## Table of Contents
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Navigation](#navigation)
- [Lists Management](#lists-management)
- [List Items](#list-items)
- [Comments and Collaboration](#comments-and-collaboration)
- [User Management](#user-management)
- [Groups](#groups)

## Getting Started

### System Requirements
- Web browser with JavaScript enabled
- Internet connection for API access

### First Time Setup
1. Navigate to the application URL
2. Create a new account or log in with existing credentials
3. Start creating your first list

## Authentication

### Login Process
- **Automatic Redirect**: If you're not logged in, you'll be automatically directed to the `/login` page
- **Login Form**: Enter your registered email address and password
- **Authentication**: The application uses secure basic authentication
- **Error Handling**: Invalid credentials will display an appropriate error message

### Account Management
- **Registration**: Clicking the "Register new user" button on the login page will take the user to a Registration form
- **Password Requirements**: Passwords must be at least 6 characters long
- **Email Validation**: Valid email format is required for all accounts
- **Account Details**: Users can enter a name along with their authentication details
- **Account Limitations**: Users cannot change their account details or delete their account after registration

### Account Activation
- **Activation Form**: an account activation form is available at the `/activate` page.
- **Account Information**: The activation form requests the user's name and a new password.
- **Activation**: When the user clicks the "Activate" button on the form, their account will be updated with the new details and the "activated" flag will be set to true

### Logout
- **Logout Button**: Located in the upper right corner of the screen
- **Immediate Effect**: Clicking logout will immediately end your session and redirect to the login page
- **Security**: All authentication data is cleared upon logout

## Navigation

### Default View
- **Empty screen**: Prompts the user to select an item from the navigation pane.

### Main Layout
- **Left Navigation Pane**: Primary navigation area for accessing lists and groups
- **Main Content Area**: Displays selected list contents and item details
- **Header**: Contains user information and logout functionality

### Navigation Pane Features
- **Collapsible Sections**: Separate expandable sections for "Lists" and "Groups"
- **Add New Items**: "+" button next to each section title allows creation of new lists or groups
- **Quick Access**: Click on any list or group name to view its contents immediately
- **Visual Organization**: Clear hierarchy and organization of your content
- **Group Integration**: Groups display shared lists and member information
- **List Organization**: All lists owned by the current user are displayed in the "Lists" section (in addition to being nested within the appropriate groups)
- **Group Content**: Lists that have been shared with a group appear nested beneath the group in the navigation pane
- **Unified List Access**: When a user selects a list from the navigation pane, regardless of whether they clicked on the instance in the "Lists" section or nested beneath a group, they are taken to the same list page
- **Mobile Behavior**: On mobile devices, the left navigation pane collapses to the left and can be revealed by clicking a menu icon in the upper left corner. An "x" icon in the upper right corner of the pane collapses it again.

## Lists Management

### Viewing Lists
- **List Selection**: Click on any list in the navigation pane to view its contents
- **Main Display**: Selected list items appear in the main content area
- **List Information**: Title and metadata are displayed at the top

### Creating Lists
1. Click the "+" button next to the "Lists" section in the navigation pane
2. Enter a descriptive title for your new list
3. Confirm creation to add the list to your collection

### Managing Lists
- **Delete Lists**: Use the "delete list" button located in the upper right of the list view
- **Edit Lists**: Modify list titles and properties as needed
- **Modal Editor**: When the "Edit" button is pressed, a modal is displayed to show the user editable fields.
- **Modal Behavior**: Modals can be closed by clicking outside the modal, clicking "Save" when editing, or clicking "Cancel"
- **List Ownership**: You can only delete lists that you own
- **Share with Groups**: List owners can share their lists with groups they belong to for collaborative access
- **Sharing Interface**: Within the list detail modal, there is a "Shared with" section that displays what groups a list has been shared with, and allows the owner to add and remove groups from the set
- **Manage Sharing**: View which groups have access to your lists and remove sharing as needed
- **Content Restrictions**: There are no character restrictions in list titles or descriptions

### List Properties
- **Title**: Required field with a maximum of 255 characters
- **Creation Date**: Automatically tracked when the list is created
- **Last Modified**: Updated whenever the list or its items are changed
- **Owner**: The user who created the list
- **Content Limits**: Lists may contain up to 1000 items
- **User Limits**: Users may create up to 100 lists
- **Sharing Limits**: Lists may be shared with up to 100 groups

## List Items

### Adding New Items
1. Navigate to the desired list
2. Click the "+" button at the bottom of the list
3. A modal dialog will appear with item creation form
4. Fill in the required information:
   - **Title**: Required field (1-255 characters)
   - **Description**: Optional detailed description

### Item Properties
- **Title**: Brief, descriptive name for the item
- **Description**: Optional longer text field for additional details
- **Creation Date**: Automatically tracked
- **Last Modified**: Updated when item is edited

### Managing Items
- **Edit Items**: Modify title and description of existing items
- **Delete Items**: Remove items from lists (only available to list owners)
- **Comment Limits**: Items may have up to 100 comments

## Comments and Collaboration

### Viewing Comments
- **Access**: Available when viewing lists that have been shared with groups you belong to (except on list items you own)
- **Owner Restriction**: List owners cannot see comments on lists that they own, nor any details related to comments
- **Display**: Comments are shown in item detail modals
- **Author Information**: Each comment shows who wrote it and when
- **Comment Order**: Comments are appended to list items in the order received

### Adding Comments
1. Navigate to a list that has been shared with a group you belong to (excluding lists you own)
2. Click on the item you want to comment on to open the item detail modal
3. Use the comment section at the bottom of the modal to enter your comment text (1-5000 characters)
4. Submit the comment

### Comment Features
- **Character Limit**: Comments can be up to 5,000 characters long
- **Edit Capability**: Users can edit their own comments
- **Timestamps**: All comments include creation and modification times
- **User Attribution**: Comments are linked to the user who created them
- **Content Restrictions**: There are no character restrictions in comments
- **Moderation**: There are no content moderation mechanisms

### Collaboration Rules
- **List Ownership**: Only list owners can modify list items
- **List Visibility**: Users can view any lists that have been shared with a group that the user also belongs to
- **Group Access**: Lists shared with groups are accessible to all group members
- **Comment Visibility**: List owners cannot see comments on lists that they own
- **Comment Access**: Users can comment on items within lists that have been shared with groups they belong to, except on items within lists they own
- **Cross-Group Comments**: If a list is shared with multiple groups, comments from all users are visible to both groups (except to the list owner)
- **Permissions**: Comment authors can edit their own comments
- **Ownership Transfer**: List ownership cannot be transferred

## User Management

### User Roles
- **Standard Users**: Can create lists, items, and comments
- **Account Limitations**: All users have the same permissions; no admin functionality is available

### Profile Management
- **Account Restrictions**: Users cannot change their account details or delete their account
- **Data Export**: Users cannot export their data
- **Account Settings**: Account information is fixed after registration

## Groups

Groups enable collaborative list sharing and team management. Users can create groups, invite members, and share lists with entire groups for collaborative access.

### Creating Groups
1. Click the "+" button next to the "Groups" section in the navigation pane
2. Enter a descriptive name for your group (required, 1-255 characters)
3. Optionally add a description (up to 1000 characters)
4. Confirm creation to add the group to your collection

### Group Management
- **View Groups**: Click on any group in the navigation to see group details and membership in the main content pane
  - **Group Display**: The main content pane displays the group name, list of group members, and group description
  - **Edit Access**: These fields can only be edited by the group owner
  - **Edit Interface**: To edit group details, the owner can click the "Edit" button that is right-justified and in-line with the group title
  - **Shared Lists Display**: Lists shared with the group are displayed both nested beneath the group in the navigation pane and beneath the group details display
  - **List Navigation**: Clicking on a list beneath the group details display will navigate the user to the selected list
- **Edit Groups**: Group creators can modify group name and description
- **Delete Groups**: Only the group creator can delete a group
- **Group Ownership**: The user who creates a group becomes its owner/creator
- **Content Interface**: All content detail interfaces are presented as modals
- **Deletion Effects**: If a group is deleted with shared lists, the lists will no longer be shared with the now deleted group but remain visible and editable by the list owner
- **Member Notifications**: Group members are not notified when a group is deleted

### Group Membership
- **Adding Members**: Group creators can invite users by providing email addresses
  - **Email Autocomplete**: When typing an email address, an autocomplete selection box appears with registered users
  - **Mobile Autocomplete**: On mobile, email autocomplete suggestions are limited to a single email
  - **New User Creation**: If inviting an unregistered user, a new account will be created and a registration link emailed to them
  - **Invitation Restrictions**: Users cannot directly invite new users to the Lister application; they can only add users to groups. The backend will only send an invitation if a user does not exist with the email address
  - **Immediate Addition**: Users are immediately added to the group when invited
  - **Member Interface**: Within the group detail modal, there is a "members" section that displays the users that belong to that group, and allows the owner to add and remove users from the set
  - **Email Validation**: If a user attempts to add an invalid email address to a group, an error is displayed indicating that the email address is invalid
- **Viewing Members**: All group members can see the complete member list
- **Member Visibility**: Group members can see the name of other users within the group
- **Removing Members**: 
  - Group creators can remove any member
  - Members can remove themselves from groups
- **Member Permissions**: All group members have equal access to shared content
- **Group Limits**: Groups may contain up to 100 people
- **Privacy**: Groups are not discoverable; they are invitation only

### List Sharing with Groups
- **Share Lists**: List owners can share their lists with any group they belong to
- **Multiple Group Sharing**: Lists may be shared with multiple groups (up to 100 groups per list)
- **Cross-Group Comments**: If a list is shared with multiple groups, comments from all users are visible to both groups (except to the list owner)
- **View Shared Lists**: Group members can view all lists shared with their group
- **Access Control**: 
  - Only list owners can share/unshare their lists
  - Group membership grants read access to shared lists
  - List owners retain full control over their shared lists
- **Unshare Lists**: List owners can remove their lists from group sharing at any time
- **Content Restrictions**: Groups can only contain lists (not other groups)

### Group Permissions Model
- **Group Creator**: 
  - Full control over group settings (name, description)
  - Can add/remove any member
  - Can delete the entire group
- **Group Members**:
  - Can view group details and member list
  - Can access all lists shared with the group
  - Can share their own lists with the group
  - Can remove themselves from the group
- **List Sharing**:
  - List owners maintain full ownership regardless of sharing
  - Shared lists remain under original owner's control
  - Group members get read-only access to shared content

### Collaborative Workflows
- **Team Lists**: Create groups for teams, families, or project collaborators
- **Shared Planning**: Multiple users can view and comment on shared lists
- **Access Management**: Easily control who has access to specific lists through group membership
- **Organized Sharing**: Share multiple lists with the same set of people efficiently

## Troubleshooting

### Common Issues
- **Login Problems**: Verify email and password are correct
- **Permission Errors**: Ensure you have appropriate access to the resource
- **Loading Issues**: Check internet connection and refresh the page
- **Data Retrieval Errors**: When data cannot be retrieved from the backend, a warning label appears in place of the content

### Concurrent Editing Behavior
- **Last Save Wins**: In cases of simultaneous users editing content, the last user to save will override everything else
- **Deleted Parent Objects**: If attempting to save new content to an object that has since been deleted, the app will display an error stating that the parent object has been deleted
- **Content Persistence**: Unsaved modal content is cached locally and restored if the user navigates back to the same content, but is not persisted
- **Real-time Updates**: There are no real-time updates

### Mobile Considerations
- **Modal Display**: On mobile, modals fill the screen
- **Large Content**: No special accommodations are made for large groups, lists, or comment sections

### Technical Requirements
- **Browser Support**: It is expected that users will access the application via a modern browser. Legacy browsers are not explicitly supported
- **Accessibility**: There are no accessibility accommodations

### Getting Help
- **Error Messages**: Pay attention to specific error messages for guidance
- **Browser Compatibility**: Ensure you're using a supported web browser
- **Clear Cache**: Try clearing browser cache if experiencing issues

---

*This documentation reflects the current state of the Lister application.*

