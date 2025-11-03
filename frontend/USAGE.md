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
- **Registration**: New users can create accounts through the registration process, accessible from the login page
- **Password Requirements**: Passwords must be at least 6 characters long
- **Email Validation**: Valid email format is required for all accounts

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
- **Quick Access**: Click on any list name to view its contents immediately
- **Visual Organization**: Clear hierarchy and organization of your content

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
- **List Ownership**: You can only delete lists that you own

### List Properties
- **Title**: Required field with a maximum of 255 characters
- **Creation Date**: Automatically tracked when the list is created
- **Last Modified**: Updated whenever the list or its items are changed
- **Owner**: The user who created the list

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
- **Item Ordering**: Items may be dragged and dropped for reordering

## Comments and Collaboration

### Viewing Comments
- **Access**: Available when viewing lists that belong to other users
- **Display**: Comments are shown alongside or below each item
- **Author Information**: Each comment shows who wrote it and when

### Adding Comments
1. Navigate to a list that belongs to another user
2. Select the item you want to comment on
3. Enter your comment text (1-5000 characters)
4. Submit the comment

### Comment Features
- **Character Limit**: Comments can be up to 5,000 characters long
- **Edit Capability**: Users can edit their own comments
- **Timestamps**: All comments include creation and modification times
- **User Attribution**: Comments are linked to the user who created them

### Collaboration Rules
- **List Ownership**: Only list owners can modify list items
- **List Visibililty**: Users can view any lists that have been shared with a group that the user also belongs to
- **Comment Access**: Any authenticated user can comment on items in lists they can view
- **Permissions**: Comment authors can edit their own comments

## User Management

### User Roles
- **Standard Users**: Can create lists, items, and comments
- **Admin Users**: Have additional permissions for user management

### Profile Management
- **Email Updates**: Users can update their email address
- **Password Changes**: Secure password modification
- **Account Settings**: Manage personal preferences and settings

## Groups

> **STATUS**: Groups functionality is currently under development.

### Planned Features
- **Group Creation**: Ability to organize lists into logical groups
- **Group Management**: Add/remove lists from groups
- **Collaborative Groups**: Share groups with other users
- **Group Permissions**: Control access and editing rights within groups

> **OPEN QUESTIONS FOR GROUPS**:
> - How do groups relate to lists? Are they just organizational containers or do they have additional functionality?
> - Can groups be shared between users?
> - Are there group-level permissions separate from list permissions?
> - Can groups contain other groups (nested hierarchy)?
> - Is there a limit to the number of groups or lists per group?

## Troubleshooting

### Common Issues
- **Login Problems**: Verify email and password are correct
- **Permission Errors**: Ensure you have appropriate access to the resource
- **Loading Issues**: Check internet connection and refresh the page

### Getting Help
- **Error Messages**: Pay attention to specific error messages for guidance
- **Browser Compatibility**: Ensure you're using a supported web browser
- **Clear Cache**: Try clearing browser cache if experiencing issues

---

*This documentation reflects the current state of the Lister application. Features marked as "TODO" or with open questions are under development or require further specification.*

