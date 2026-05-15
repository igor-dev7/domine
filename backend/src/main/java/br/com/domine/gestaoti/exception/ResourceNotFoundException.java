package br.com.domine.gestaoti.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException of(String entidade, Object id) {
        return new ResourceNotFoundException(entidade + " com id " + id + " não encontrado");
    }
}
