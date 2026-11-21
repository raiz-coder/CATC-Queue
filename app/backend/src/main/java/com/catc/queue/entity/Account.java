package com.catc.queue.entity;
import jakarta.persistence.*;
/** One table for students, professors and admins. Role-specific fields (course, reference, department...) live in the profile JSON. */
@Entity @Table(name="accounts")
public class Account {
  @Id public String id;
  @Column(unique=true,nullable=false) public String email;
  @Column(unique=true) public String sid;    // Student ID
  @Column(unique=true) public String empId;  // Employee ID
  public String role;                         // student | professor | admin
  public String pw;                           // BCrypt hash
  @Lob @Column(length=3000000) public String profile;
}
