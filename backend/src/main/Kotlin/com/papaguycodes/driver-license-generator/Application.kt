<!-- //💡In the Beginning, PaPaGuy wrote beautiful Codes < /> 💜❤️ // -->
package com.papaguycodes.driver-license-generator

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.jackson.jackson
import io.ktor.server.application.*
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.cors.routing.cors
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.receive
import io.ktor.response.respond
import io.ktor.routing.*

fun main() {
    embeddedServer(Netty, port = 8080, module = Application::module).start(wait = true)
}

fun Application.module() {
    install(CORS) {
        anyHost()
        method(HttpMethod.Post)
        header(HttpHeaders.ContentType)
    }

    install(ContentNegotiation) {
        jackson { }
    }

    install(StatusPages) {
        exception<Throwable> { cause ->
            call.respond(HttpStatusCode.InternalServerError, cause.localizedMessage)
        }
    }

    routing {
        route("/generate") {
            post {
                val params = call.receive<LicenseRequest>()
                val license = generateLicense(params.state, params.firstName, params.lastName)
                call.respond(LicenseResponse(license))
            }
        }

        route("/validate") {
            post {
                val params = call.receive<ValidationRequest>()
                val isValid = validateLicenseNumber(params.state, params.licenseNumber)
                call.respond(mapOf("valid" to isValid))
            }
        }
    }
}

data class LicenseRequest(val state: String, val firstName: String, val lastName: String)
data class LicenseResponse(val licenseNumber: String)
data class ValidationRequest(val state: String, val licenseNumber: String)

fun generateLicense(state: String, firstName: String, lastName: String): String {
    val initials = "${firstName.firstOrNull()?.uppercaseChar() ?: 'X'}${lastName.firstOrNull()?.uppercaseChar() ?: 'X'}"
    val randomDigits = (100000..999999).random().toString()
    return "$state-$initials-$randomDigits"
}

fun validateLicenseNumber(state: String, licenseNumber: String): Boolean {
    val stateCode = state.trim().uppercase()
    val validStates = setOf(
        "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI",
        "ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI",
        "MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC",
        "ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
        "VT","VA","WA","WV","WI","WY","DC"
    )

    if (stateCode !in validStates) return false
    val regex = Regex("^${Regex.escape(stateCode)}-[A-Z]{2}-\\d{6}$")
    return regex.matches(licenseNumber.trim().uppercase())
}
