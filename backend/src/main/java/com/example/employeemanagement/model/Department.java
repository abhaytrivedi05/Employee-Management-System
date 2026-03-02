package com.example.employeemanagement.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;
<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonIgnore;
=======
import com.fasterxml.jackson.annotation.JsonManagedReference;
>>>>>>> 2824bd05f5e0468b4a0aa0583fb5169e6434e350
import java.util.List;

/** This class represents a Department entity. Each department has an ID and a name. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "departments")
public class Department {

  /** The ID of the department. It is unique and generated automatically. */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** The name of the department. */
  private String name;

  /** The list of employees in the department. */
  @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
<<<<<<< HEAD
  @JsonIgnore
=======
  @JsonManagedReference
>>>>>>> 2824bd05f5e0468b4a0aa0583fb5169e6434e350
  private List<Employee> employees;
}
