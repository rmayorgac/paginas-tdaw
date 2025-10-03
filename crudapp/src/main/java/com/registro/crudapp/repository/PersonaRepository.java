package com.registro.crudapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.registro.crudapp.model.Persona;

public interface PersonaRepository extends JpaRepository<Persona, Long> {
}
