"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCategory = exports.TaskStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["Owner"] = "owner";
    Role["Admin"] = "admin";
    Role["Viewer"] = "viewer";
})(Role || (exports.Role = Role = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Todo"] = "todo";
    TaskStatus["InProgress"] = "in_progress";
    TaskStatus["Done"] = "done";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskCategory;
(function (TaskCategory) {
    TaskCategory["Work"] = "work";
    TaskCategory["Personal"] = "personal";
})(TaskCategory || (exports.TaskCategory = TaskCategory = {}));
//# sourceMappingURL=enums.js.map