
package com.catc.queue.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequestDTO {

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String sid;
    private String empId;
    private String course;
    private String dept;
    private String status;

    public RegisterRequestDTO() {}

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getSid() { return sid; }
    public void setSid(String sid) { this.sid = sid; }

    public String getEmpId() { return empId; }
    public void setEmpId(String empId) { this.empId = empId; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getDept() { return dept; }
    public void setDept(String dept) { this.dept = dept; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
