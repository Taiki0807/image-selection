package app

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gorilla/mux"
	"github.com/sugyan/image-dataset/web/entity"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type queryFilter struct {
	path  string
	op    string
	value interface{}
}

type queryOrder struct {
	Field string
	Desc  bool
}

type query struct {
	Filter []*queryFilter
	Order  *queryOrder
}

const limit = 30

var (
	sizeMap = map[string]string{
		"256":  "Size0256",
		"512":  "Size0512",
		"1024": "Size1024",
	}
	sortMap = map[string]string{
		"id":           "ID",
		"updated_at":   "UpdatedAt",
		"published_at": "PublishedAt",
	}
)

func (app *App) imagesHandler(w http.ResponseWriter, r *http.Request) {
	images, err := app.fetchImages(r)
	if err != nil {
		log.Printf("failed to fetch data: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&images); err != nil {
		log.Printf("failed to encode images: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}

func (app *App) updateImageHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var data struct {
		Status entity.Status `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		log.Printf("failed to decode json: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	if err := app.updateImage(r.Context(), vars["id"], data.Status); err != nil {
		log.Printf("failed to update status: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type Data1 struct {
	ID string `json:"id"`
	Title string `json:"title"`
	Message string `json:"message"`
}

func (app *App) likeImageHandler(w http.ResponseWriter, r *http.Request) {
	_,_, err := app.fsClient.Collection("users").Add(r.Context(),map[string]interface{}{
        "first": "Ada",
        "last":  "Lovelace",
        "born":  1815,
    })
	if err != nil {
        log.Fatalf("Failed adding alovelace: %v", err)
    }
	log.Printf("likeimage")
	var data1 = Data1 {
		ID:"1",
		Title:"sample1",
		Message: "hello",
	}
    // ????????????????????????????????????
    w.Header().Set("Content-Type", "application/json; charset=UTF-8")

    // ?????????????????????????????????
    w.WriteHeader(200)

    // httpResponse????????????????????????
    buf, _ := json.Marshal(data1)
    _, _ = w.Write(buf)
}
// ???????????????
type User struct {
    Uid string `json:"uid"`
    Image_url  string    `json:"image_url"`
	Status  int    `json:"status"`
}
var Good []string
var Bad []string
func (app *App) userImageHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("userimage")
	var user User
    json.NewDecoder(r.Body).Decode(&user)
	if(user.Status == 3){
		newslice := append(Good,user.Image_url)
		Good = newslice
	}else if(user.Status == 1){
		newslice := append(Bad,user.Image_url)
		Bad = newslice
	}
	log.Printf("url:"+user.Image_url)
	_, err := app.fsClient.Collection("users").Doc(user.Uid).Set(r.Context(),map[string]interface{}{
        "goodimage_url": Good,
		"badimage_url": Bad,
		"updatedAt": time.Now(),
    },firestore.MergeAll)
	if err != nil {
        log.Fatalf("Failed adding data: %v", err)
    }

}
type Data_image struct {
	Likeimageurl string `json:"url"`
}

func (app *App) getlikeimageHandler(w http.ResponseWriter, r *http.Request) {
    r.ParseForm()
	Uid := r.Form.Get("uid")
	// ?????????????????????
	ref, err := app.fsClient.Collection("users").Doc(Uid).Get(r.Context())
	log.Printf(Uid)
	if err != nil {
        log.Fatalf("Failed adding data: %v", err)
    }
	log.Printf("likeimageurl")
	url, err := ref.DataAt("likeface_url")
	if err != nil {
        log.Fatalf("Failed adding data: %v", err)
    }
	var data1 = Data_image {
		Likeimageurl:url.(string),
	}
    // ????????????????????????????????????
    w.Header().Set("Content-Type", "application/json; charset=UTF-8")

    // ?????????????????????????????????
    w.WriteHeader(200)

    // httpResponse????????????????????????
    buf, _ := json.Marshal(data1)
    _, _ = w.Write(buf)
}


func (app *App) usersimageHandler(w http.ResponseWriter, r *http.Request) {
	images, err := app.fetchusersImages(r)
	if err != nil {
		log.Printf("failed to fetch data: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&images); err != nil {
		log.Printf("failed to encode images: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}
// ???????????????
type matching struct {
    Uid string `json:"uid"`
    Touid  string    `json:"touid"`
	Status int `json:status`
}
var matchinguid []string
var likeuser []string
func (app *App) updatematching(w http.ResponseWriter, r *http.Request) {
	log.Printf("updatemaching")
	var data matching
    json.NewDecoder(r.Body).Decode(&data)
	if(data.Status == 3){
		newslice := append(likeuser,data.Touid)
		likeuser = newslice
		newslice = append(matchinguid,data.Touid)
		matchinguid = newslice
	}else if(data.Status == 1){
		return
	}
	_, err := app.fsClient.Collection("matching").Doc(data.Uid).Set(r.Context(),map[string]interface{}{
        "likeuser":likeuser,
		"matched":matchinguid,
		"updatedAt": time.Now(),
    })
	if err != nil {
        log.Fatalf("Failed adding data: %v", err)
    }
}


func (app *App) statsHandler(w http.ResponseWriter, r *http.Request) {
	results := []*countResponse{}
	collection := app.fsClient.Collection(entity.KindNameCount)
	if err := func() error {
		docIDs := []string{"0256", "0512", "1024"}
		for _, docID := range docIDs {
			docRef := collection.Doc(docID)
			doc, err := docRef.Get(r.Context())
			var count entity.Count
			if err != nil {
				if status.Code(err) == codes.NotFound {
					docRef.Set(r.Context(), &count)
				} else {
					return err
				}
			} else {
				if err := doc.DataTo(&count); err != nil {
					return err
				}
			}
			results = append(results, &countResponse{
				Size:      docID,
				Ready:     count.Ready,
				NG:        count.NG,
				Pending:   count.Pending,
				OK:        count.OK,
				Predicted: count.Predicted,
			})
		}
		return nil
	}(); err != nil {
		log.Printf("failed to load stats: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(&results); err != nil {
		log.Printf("failed to encode stats: %s", err.Error())
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}

func (app *App) fetchImages(r *http.Request) ([]*imageResponse, error) {
	query, err := app.makeQuery(r)
	if err != nil {
		return nil, err
	}
	images := []*imageResponse{}
	iter := query.Documents(r.Context())
	for {
		document, err := iter.Next()
		if err != nil {
			if errors.Is(err, iterator.Done) {
				break
			} else {
				return nil, err
			}
		}
		var image entity.Image
		if err := document.DataTo(&image); err != nil {
			return nil, err
		}
		images = append(images, &imageResponse{
			ID:          image.ID,
			ImageURL:    image.ImageURL,
			Size:        image.Size,
			Status:      int(image.Status),
			Parts:       image.Parts,
			LabelName:   image.LabelName,
			SourceURL:   image.SourceURL,
			PhotoURL:    image.PhotoURL,
			PublishedAt: image.PublishedAt.Unix(),
			UpdatedAt:   image.UpdatedAt.Unix(),
			Meta:        string(image.Meta),
		})
	}
	return images, nil
}


func (app *App) fetchusersImages(r *http.Request) ([]*usersimageResponse, error) {
	query, err := app.makeQuery_user(r)
	if err != nil {
		return nil, err
	}
	images := []*usersimageResponse{}
	iter := query.Documents(r.Context())
	for {
		document, err := iter.Next()
		if err != nil {
			if errors.Is(err, iterator.Done) {
				break
			} else {
				return nil, err
			}
		}
		var image entity.UserImage
		if err := document.DataTo(&image); err != nil {
			return nil, err
		}
		images = append(images, &usersimageResponse{
			ID:          image.ID,
			ImageURL:    image.ImageURL,
			UID:         image.UID,
			UpdatedAt:   image.UpdatedAt.Unix(),
		})
	}
	return images, nil
}

func (app *App) makeQuery(r *http.Request) (*firestore.Query, error) {
	values := r.URL.Query()
	collection := app.fsClient.Collection(entity.KindNameImage)
	query := collection.Query
	if values.Get("count") != "" {
		count, err := strconv.Atoi(values.Get("count"))
		if err != nil {
			return nil, err
		}
		query = query.Limit(count)
	} else {
		query = query.Limit(limit)
	}
	// `Where`
	{
		filters := []*queryFilter{}
		if values.Get("name") != "" {
			filters = append(filters, &queryFilter{
				path:  "LabelName",
				op:    "==",
				value: values.Get("name"),
			})
		}
		if values.Get("status") != "" && values.Get("status") != "all" {
			status, err := strconv.Atoi(values.Get("status"))
			if err != nil {
				return nil, err
			}
			filters = append(filters, &queryFilter{
				path:  "Status",
				op:    "==",
				value: status,
			})
		}
		if values.Get("size") != "" && values.Get("size") != "all" {
			if key, ok := sizeMap[values.Get("size")]; ok {
				filters = append(filters, &queryFilter{
					path:  key,
					op:    "==",
					value: true,
				})
			} else {
				return nil, fmt.Errorf("invalid size query: %v", values.Get("size"))
			}
		}
		for _, filter := range filters {
			query = query.Where(filter.path, filter.op, filter.value)
		}
	}
	// `Order`
	{
		if values.Get("sort") != "" {
			if path, ok := sortMap[values.Get("sort")]; ok {
				reverse := values.Get("reverse") == "true"
				if values.Get("order") == "desc" {
					reverse = !reverse
				}
				if values.Get("id") != "" {
					var op string
					if reverse {
						op = "<="
					} else {
						op = ">="
					}

					var image entity.Image
					document, err := collection.Doc(values.Get("id")).Get(context.Background())
					if err != nil {
						return nil, err
					}
					if err := document.DataTo(&image); err != nil {
						return nil, err
					}
					switch path {
					case "ID":
						query = query.Where(path, op, image.ID)
					case "PublishedAt":
						query = query.Where(path, op, image.PublishedAt)
					case "UpdatedAt":
						query = query.Where(path, op, image.UpdatedAt)
					}
				}
				if reverse {
					query = query.OrderBy(path, firestore.Desc)
				} else {
					query = query.OrderBy(path, firestore.Asc)
				}
			} else {
				return nil, fmt.Errorf("invalid sort query: %v", values.Get("sort"))
			}
		}
	}
	return &query, nil
}


func (app *App) makeQuery_user(r *http.Request) (*firestore.Query, error) {
	values := r.URL.Query()
	collection := app.fsClient.Collection(entity.KindNameUserImage)
	query := collection.Query
	if values.Get("count") != "" {
		count, err := strconv.Atoi(values.Get("count"))
		if err != nil {
			return nil, err
		}
		query = query.Limit(count)
	} else {
		query = query.Limit(limit)
	}
	// `Order`
	{
		if values.Get("sort") != "" {
			if path, ok := sortMap[values.Get("sort")]; ok {
				reverse := values.Get("reverse") == "true"
				if values.Get("order") == "desc" {
					reverse = !reverse
				}
				if values.Get("id") != "" {
					var op string
					if reverse {
						op = "<="
					} else {
						op = ">="
					}
					var image entity.Image
					document, err := collection.Doc(values.Get("id")).Get(context.Background())
					if err != nil {
						return nil, err
					}
					if err := document.DataTo(&image); err != nil {
						return nil, err
					}
					switch path {
					case "ID":
						query = query.Where(path, op, image.ID)
					case "PublishedAt":
						query = query.Where(path, op, image.PublishedAt)
					case "UpdatedAt":
						query = query.Where(path, op, image.UpdatedAt)
					}
				}
				if reverse {
					query = query.OrderBy(path, firestore.Desc)
				} else {
					query = query.OrderBy(path, firestore.Asc)
				}
			} else {
				return nil, fmt.Errorf("invalid sort query: %v", values.Get("sort"))
			}
		}
	}
	return &query, nil
}
func (app *App) updateImage(ctx context.Context, id string, status entity.Status) error {
	return app.fsClient.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		docRef := app.fsClient.Collection(entity.KindNameImage).Doc(id)
		doc, err := tx.Get(docRef)
		if err != nil {
			log.Printf("failed to get document: %s", err.Error())
			return err
		}
		var image entity.Image
		if err := doc.DataTo(&image); err != nil {
			log.Printf("failed to retrieve image from document: %s", err.Error())
			return err
		}
		if image.Status != status {
			// Update counts
			for i, b := range []bool{image.Size0256, image.Size0512, image.Size1024} {
				if b {
					docID := []string{"0256", "0512", "1024"}[i]
					ref := app.fsClient.Collection(entity.KindNameCount).Doc(docID)
					if err := tx.Update(ref, []firestore.Update{
						{Path: image.Status.Path(), Value: firestore.Increment(-1)},
						{Path: status.Path(), Value: firestore.Increment(1)},
					}); err != nil {
						return err
					}
				}
			}
			// Update status
			image.Status = entity.Status(status)
			image.UpdatedAt = time.Now()
			if err := tx.Set(docRef, &image); err != nil {
				log.Printf("failed to set document: %s", err.Error())
				return err
			}

		}
		return nil
	})
}