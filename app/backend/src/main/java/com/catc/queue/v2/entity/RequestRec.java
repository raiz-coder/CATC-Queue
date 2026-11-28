package com.catc.queue.v2.entity;
import jakarta.persistence.*;
@Entity @Table(name="requests")
public class RequestRec {
  @Id public String id;
  @Column(unique=true) public String ref;   // unique booking reference number
  public String studentId, professorId;
  @Lob @Column(length=100000) public String json;
}
