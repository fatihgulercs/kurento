/*
 * (C) Copyright 2013 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */
package org.kurento.jsonrpc.internal.ws;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.kurento.jsonrpc.JsonRpcException;
import org.kurento.jsonrpc.message.Response;
import org.kurento.jsonrpc.message.ResponseError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Preconditions;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.SettableFuture;
import com.google.gson.JsonElement;

public class PendingRequests {

	private static final Logger log = LoggerFactory
			.getLogger(PendingRequests.class);

	private final ConcurrentMap<Integer, SettableFuture<Response<JsonElement>>> pendingRequests = new ConcurrentHashMap<>();

	public void handleResponse(Response<JsonElement> response) {

		log.debug("Processing response {}", response);

		SettableFuture<Response<JsonElement>> responseFuture = pendingRequests
				.remove(response.getId());

		if (responseFuture == null) {
			// TODO It is necessary to do something else? Who is watching this?
			log.error(
					"Received response with an id not registered as pending request");
		} else {
			log.debug("Just to set response in request {}", response.getId());
			responseFuture.set(response);
		}
	}

	public ListenableFuture<Response<JsonElement>> prepareResponse(Integer id) {

		Preconditions.checkNotNull(id, "The request id cannot be null");

		SettableFuture<Response<JsonElement>> responseFuture = SettableFuture
				.create();

		if (pendingRequests.putIfAbsent(id, responseFuture) != null) {
			throw new JsonRpcException("Can not send a request with the id '"
					+ id
					+ "'. There is already a pending request with this id");
		} else {
			log.debug("Setted SettableFuture for request {}", id);
		}

		return responseFuture;
	}

	public void closeAllPendingRequests() {
		log.info("Sending error to all pending requests");
		for (SettableFuture<Response<JsonElement>> responseFuture : pendingRequests
				.values()) {
			responseFuture.set(new Response<JsonElement>(new ResponseError(0,
					"Connection with server have been closed")));
		}
		pendingRequests.clear();
	}

}
