package com.sangyunpark.backend.auth.filter;

import com.sangyunpark.backend.auth.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION = "Authorization";
    private static final String BEARER = "Bearer ";
    private static final int TOKEN_INDEX = 7;
    private static final String USER_ID = "userId";

    private static final Set<String> EXCLUDED_URLS = Set.of(
            "/api/auth/login",
            "/api/auth/signup",
            "/api/auth/reissue"
    );

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();
        if(EXCLUDED_URLS.contains(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorization = request.getHeader(AUTHORIZATION);

        if (authorization == null || !authorization.startsWith(BEARER)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String token = authorization.substring(TOKEN_INDEX);

        if (!jwtTokenProvider.validate(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        Long userId = jwtTokenProvider.getUserId(token);
        request.setAttribute(USER_ID, userId);

        filterChain.doFilter(request, response);
    }
}
